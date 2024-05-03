import { ethers } from 'ethers';
import { injectable } from 'inversify';
import ERC20_ABI from 'src/config/abi/ERC20.json';
import { addressToBytes32 } from 'src/config/web3';
import ERC20_ASTAR_OFT_ABI from 'src/config/web3/abi/layerzero/oft-astar-bridge-abi.json';
import ASTR_OFT_ABI from 'src/config/web3/abi/layerzero/oft-astar-native-abi.json';
import ERC20_ZKEVM_OFT_ABI from 'src/config/web3/abi/layerzero/oft-zkevm-bridge-abi.json';
import { LayerZeroId } from 'src/modules/zk-evm-bridge';
import { ParamApprove, ParamBridgeLzAsset } from 'src/v2/services/ILzBridgeService';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { ILzBridgeRepository } from '../ILzBridgeRepository';

@injectable()
export class LzBridgeRepository implements ILzBridgeRepository {
  constructor() {}

  public async getApproveData({
    param,
    web3,
  }: {
    param: ParamApprove;
    web3: Web3;
  }): Promise<TransactionConfig> {
    const { contractAddress, tokenAddress } = param;
    const contract = new web3.eth.Contract(ERC20_ABI as AbiItem[], tokenAddress);

    const data = contract.methods.approve(contractAddress, param.amount).encodeABI();
    return {
      from: param.senderAddress,
      to: tokenAddress,
      value: '0x0',
      data,
    };
  }

  public async getBridgeLzAssetData({
    param,
    web3,
  }: {
    param: ParamBridgeLzAsset;
    web3: Web3;
  }): Promise<{ txParam: TransactionConfig; nativeFee: number }> {
    const { token, fromNetworkId, destNetworkId, senderAddress, amount, minAmount, isNativeToken } =
      param;

    const contractAddress = token.oftBridgeContract[fromNetworkId];

    const abi = isNativeToken
      ? ASTR_OFT_ABI
      : fromNetworkId === LayerZeroId.AstarEvm
      ? ERC20_ASTAR_OFT_ABI
      : ERC20_ZKEVM_OFT_ABI;
    const contract = new web3.eth.Contract(abi as AbiItem[], contractAddress);

    // Ref: https://docs.layerzero.network/v1/developers/evm-guides/contract-standards/oft-v1.2#how-to-deploy-proxyoft-and-oft-contracts
    const minDstGas = await contract.methods.minDstGasLookup(destNetworkId, 1).call();
    const adapterParams = ethers.utils.solidityPack(['uint16', 'uint256'], [1, Number(minDstGas)]);
    const fromAddressByte32 = addressToBytes32(senderAddress);
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const callParams = [senderAddress, zeroAddress, adapterParams];
    const decimal = token.decimals[fromNetworkId];
    const qty = ethers.utils.parseUnits(String(amount), decimal);
    const fee = await contract.methods
      .estimateSendFee(destNetworkId, fromAddressByte32, qty, false, adapterParams)
      .call();

    const data = contract.methods
      .sendFrom(
        senderAddress,
        destNetworkId,
        fromAddressByte32,
        ethers.utils.parseUnits(String(amount), decimal).toString(),
        ethers.utils.parseUnits(String(minAmount), decimal).toString(),
        callParams
      )
      .encodeABI();

    // Memo: increasing 20% of the fee to avoid transactions stacking. This is the same amount of increasing percentage as LayerZero does.
    // Ref: https://github.com/LayerZero-Labs/mainnet-testnet-bridge/blob/9c80a2c5bfaa64bee5f98c7cd450010f8eecca19/tasks/swapAndBridge.js#L13
    const increasedFee = Number(ethers.utils.formatEther(fee[0])) * 1.2;
    const nativeFee = Number(parseFloat(String(increasedFee)).toFixed(5));
    const value = ethers.utils
      .parseEther(String(isNativeToken ? amount + nativeFee : nativeFee))
      .toString();

    return {
      txParam: {
        from: senderAddress,
        to: contractAddress,
        value,
        data,
      },
      nativeFee,
    };
  }
}
