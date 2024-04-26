import ERC20_ABI from 'src/config/abi/ERC20.json';
import ASTR_OFT_ABI from 'src/config/web3/abi/oft-astar-native-abi.json';
import ERC20_OFT_ABI from 'src/config/web3/abi/oft-bridge-abi.json';
import { ethers } from 'ethers';
import { injectable } from 'inversify';
import { astarNativeTokenErcAddr } from 'src/modules/xcm/tokens/index';
import {
  EthBridgeContract,
  EthBridgeNetworkName,
  LayerZeroId,
  ZK_EVM_AGGREGATED_BRIDGE_ABI,
  ZkNetworkId,
  fetchMerkleProof,
  getMainOrTestNet,
} from 'src/modules/zk-evm-bridge';
import { ParamBridgeAsset, ParamClaim, ParamBridgeLzAsset } from 'src/v2/services';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { IZkBridgeRepository } from '../IZkBridgeRepository';
import { addressToBytes32 } from 'src/config/web3';

@injectable()
export class ZkBridgeRepository implements IZkBridgeRepository {
  constructor() {}

  public async getApproveData({
    param,
    web3,
  }: {
    param: ParamBridgeAsset;
    web3: Web3;
  }): Promise<TransactionConfig> {
    const contractAddress = EthBridgeContract[param.fromChainName];
    const tokenAddress = param.tokenAddress;
    const contract = new web3.eth.Contract(ERC20_ABI as AbiItem[], tokenAddress);

    const data = contract.methods.approve(contractAddress, param.amount).encodeABI();
    return {
      from: param.senderAddress,
      to: tokenAddress,
      value: '0x0',
      data,
    };
  }

  public async getBridgeAssetData({
    param,
    web3,
  }: {
    param: ParamBridgeAsset;
    web3: Web3;
  }): Promise<TransactionConfig> {
    if (param.destNetworkId === undefined || param.destNetworkId === null) {
      throw Error('destNetworkId is not set');
    } else if (param.destNetworkId === ZkNetworkId.L2_PolygonZk) {
      // Memo: destNetworkId shouldn't be polygonZk but check it for just in case
      throw Error('destNetworkId is Polygon zkEVM');
    }

    const contractAddress = EthBridgeContract[param.fromChainName];

    const abi = ZK_EVM_AGGREGATED_BRIDGE_ABI;
    // ABI: https://github.com/0xPolygonHermez/zkevm-bridge-ui/blob/develop/abis/bridge.json
    const contract = new web3.eth.Contract(abi as AbiItem[], contractAddress);
    const isNativeToken = param.tokenAddress === astarNativeTokenErcAddr;
    const destinationAddress = param.senderAddress;
    const amount = ethers.utils.parseUnits(String(param.amount), param.decimal).toString();
    const forceUpdateGlobalExitRoot = true;
    const permitData = '0x';

    const data = contract.methods
      .bridgeAsset(
        param.destNetworkId,
        destinationAddress,
        amount,
        param.tokenAddress,
        forceUpdateGlobalExitRoot,
        permitData
      )
      .encodeABI();

    return {
      from: param.senderAddress,
      to: contractAddress,
      value: isNativeToken ? amount : '0x0',
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
    const { token, fromNetworkId, destNetworkId, senderAddress, amount, minAmount } = param;

    const isNativeToken = fromNetworkId === LayerZeroId.AstarEvm && token.symbol === 'ASTR';
    const contractAddress = token.oftBridgeContract[fromNetworkId];
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const abi = isNativeToken ? ASTR_OFT_ABI : ERC20_OFT_ABI;
    const contract = new web3.eth.Contract(abi as AbiItem[], contractAddress);

    // Ref: https://docs.layerzero.network/v1/developers/evm-guides/contract-standards/oft-v1.2#how-to-deploy-proxyoft-and-oft-contracts
    const minDstGas = await contract.methods.minDstGasLookup(destNetworkId, 1).call();
    const adapterParams = ethers.utils.solidityPack(['uint16', 'uint256'], [1, Number(minDstGas)]);

    const fromAddressByte32 = addressToBytes32(senderAddress);
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
        ethers.utils.parseUnits(String(amount), decimal),
        ethers.utils.parseUnits(String(minAmount), decimal),
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
  }

  public async getClaimData({
    param,
    web3,
  }: {
    param: ParamClaim;
    web3: Web3;
  }): Promise<TransactionConfig> {
    const { deposit_cnt, orig_net, orig_addr, dest_net, dest_addr, amount, metadata, network_id } =
      param.withdrawal;

    const network = getMainOrTestNet();
    const contractAddress =
      network === 'mainnet'
        ? EthBridgeContract[EthBridgeNetworkName.Ethereum]
        : EthBridgeContract[EthBridgeNetworkName.Sepolia];

    const abi = ZK_EVM_AGGREGATED_BRIDGE_ABI;
    const contract = new web3.eth.Contract(abi as AbiItem[], contractAddress);

    const { main_exit_root, merkle_proof, rollup_exit_root, rollup_merkle_proof } =
      await fetchMerkleProof(deposit_cnt, Number(network_id));

    const data = contract.methods
      .claimAsset(
        merkle_proof,
        rollup_merkle_proof,
        Number(param.withdrawal.global_index),
        main_exit_root,
        rollup_exit_root,
        orig_net,
        orig_addr,
        dest_net,
        dest_addr,
        amount,
        metadata
      )
      .encodeABI();

    return {
      from: param.senderAddress,
      to: contractAddress,
      data,
    };
  }
}
