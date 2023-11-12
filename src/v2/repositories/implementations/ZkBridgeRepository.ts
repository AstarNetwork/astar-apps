import ERC20_ABI from 'src/config/abi/ERC20.json';
import { ethers } from 'ethers';
import { injectable } from 'inversify';
import { astarNativeTokenErcAddr } from 'src/modules/xcm/tokens/index';
import {
  EthBridgeContract,
  EthBridgeNetworkName,
  ZK_EVM_BRIDGE_ABI,
  ZkNetworkId,
  fetchMerkleProof,
  getContractFromNetId,
} from 'src/modules/zk-evm-bridge';
import { ParamBridgeAsset, ParamClaim } from 'src/v2/services';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { IZkBridgeRepository } from '../IZkBridgeRepository';

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
    const contractAddress = EthBridgeContract[param.fromChainName];
    // ABI: https://github.com/0xPolygonHermez/zkevm-bridge-ui/blob/7c84791d06770569d316f27d62c3989bef81be58/abis/bridge.json
    const contract = new web3.eth.Contract(ZK_EVM_BRIDGE_ABI as AbiItem[], contractAddress);

    const isToL1 =
      param.toChainName === EthBridgeNetworkName.Ethereum ||
      param.toChainName === EthBridgeNetworkName.Sepolia;

    const isNativeToken = param.tokenAddress === astarNativeTokenErcAddr;

    // Todo: Ask if `0` is L1 and `1` is L1
    const destinationNetwork = isToL1 ? ZkNetworkId.L1 : ZkNetworkId.L2;
    const destinationAddress = param.senderAddress;
    const amount = ethers.utils.parseUnits(String(param.amount), param.decimal).toString();
    // Todo: Ask if we need to care about `forceUpdateGlobalExitRoot` and `permitData`
    const forceUpdateGlobalExitRoot = true;
    const permitData = '0x';

    const data = contract.methods
      .bridgeAsset(
        destinationNetwork,
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

  public async getClaimData({
    param,
    web3,
  }: {
    param: ParamClaim;
    web3: Web3;
  }): Promise<TransactionConfig> {
    const { deposit_cnt, orig_net, orig_addr, dest_net, dest_addr, amount, metadata, network_id } =
      param.withdrawal;
    const { main_exit_root, merkle_proof, rollup_exit_root } = await fetchMerkleProof(
      deposit_cnt,
      Number(network_id)
    );

    const contractAddress = getContractFromNetId(network_id);
    const contract = new web3.eth.Contract(ZK_EVM_BRIDGE_ABI as AbiItem[], contractAddress);

    const data = contract.methods
      .claimAsset(
        merkle_proof,
        Number(deposit_cnt),
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
