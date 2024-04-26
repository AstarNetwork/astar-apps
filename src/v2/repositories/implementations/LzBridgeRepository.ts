import { ethers } from 'ethers';
import { injectable } from 'inversify';
import ERC20_ABI from 'src/config/abi/ERC20.json';
import { addressToBytes32 } from 'src/config/web3';
import ERC20_ASTAR_OFT_ABI from 'src/config/web3/abi/layerzero/oft-astar-bridge-abi.json';
import ASTR_OFT_ABI from 'src/config/web3/abi/layerzero/oft-astar-native-abi.json';
import ERC20_ZKEVM_OFT_ABI from 'src/config/web3/abi/layerzero/oft-zkevm-bridge-abi.json';
import { LayerZeroId } from 'src/modules/zk-evm-bridge';
import { ParamBridgeLzAsset } from 'src/v2/services/ILzBridgeService';
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
    param: ParamBridgeLzAsset;
    web3: Web3;
  }): Promise<TransactionConfig> {
    const { token, fromNetworkId } = param;

    const contractAddress = token.oftBridgeContract[fromNetworkId];
    const tokenAddress = param.tokenAddress[fromNetworkId];
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
  }): Promise<TransactionConfig> {
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
    console.log('minDstGas', minDstGas);
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

    const nativeFee = Number(ethers.utils.formatEther(String(fee[0])));

    const value = ethers.utils
      .parseEther(String(isNativeToken ? amount + nativeFee : nativeFee))
      .toString();

    return {
      from: senderAddress,
      to: contractAddress,
      value,
      data,
    };

    // const isNativeToken = true;

    // const astarNative = '0xdf41220C7e322bFEF933D85D01821ad277f90172';
    // const dotContract = '0x105C0F4a5Eae3bcb4c9Edbb3FD5f6b60FAcc3b36';

    // const contractAddress = isNativeToken ? astarNative : dotContract;
    // const zeroAddress = '0x0000000000000000000000000000000000000000';
    // const adapterParams = isNativeToken
    //   ? // Value: 0x000100000000000000000000000000000000000000000000000000000000000186a0
    //     // ethers.utils.solidityPack(['uint16', 'uint256'], [1, 100000])
    //     ethers.utils.solidityPack(['uint16', 'uint256'], [1, 200000])
    //   : // Value: 0x00010000000000000000000000000000000000000000000000000000000000036ee8
    //     ethers.utils.solidityPack(['uint16', 'uint256'], [1, 225000]);

    // console.log('adapterParams', adapterParams);

    // const abi = isNativeToken ? ASTR_OFT_ABI : ERC20_ASTAR_OFT_ABI;
    // const contract = new web3.eth.Contract(abi as AbiItem[], contractAddress);

    // const from = '0xb680c8f33f058163185ab6121f7582bab57ef8a7';
    // const fromAddressByte32 = addressToBytes32(from);
    // console.log('fromAddressByte32', fromAddressByte32);
    // const destChainId = 257;
    // const toAddress = fromAddressByte32;
    // // const amount = 10;
    // const amount = 0.05;
    // const minAmount = amount * 0.995;
    // const callParams = [from, zeroAddress, adapterParams];
    // const decimal = isNativeToken ? 18 : 10;
    // const qty = ethers.utils.parseUnits(String(amount), decimal);

    // console.log('adapterParams', adapterParams);
    // const fee = await contract.methods
    //   .estimateSendFee(destChainId, fromAddressByte32, qty, false, adapterParams)
    //   .call();
    // console.log('fee', fee);

    // const data = contract.methods
    //   .sendFrom(
    //     from,
    //     destChainId,
    //     toAddress,
    //     ethers.utils.parseUnits(String(amount), decimal),
    //     ethers.utils.parseUnits(String(minAmount), decimal),
    //     callParams
    //   )
    //   .encodeABI();
    // console.log('data', data);

    // // Memo: add 0.0001% fee here to avoid getting insufficient fee error
    // const nativeFee = Number(ethers.utils.formatEther(String(fee[0]))) * 1.00001;
    // console.log('amount', amount);
    // console.log('nativeFee', nativeFee);
    // const value = ethers.utils
    //   .parseEther(String(isNativeToken ? amount + nativeFee : nativeFee))
    //   .toString();
    // console.log('value', value);
    // return {
    //   from,
    //   to: contractAddress,
    //   value,
    //   data,
    // };
  }
}
