import { ethers } from 'ethers';
import { injectable } from 'inversify';
import { astarNativeTokenErcAddr } from 'src/modules/xcm/tokens/index';
import {
  EthBridgeContract,
  EthBridgeNetworkName,
  ZK_EVM_BRIDGE_ABI,
  ZkNetworkId,
} from 'src/modules/zk-evm-bridge';
import { ParamBridgeAsset } from 'src/v2/services';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { IZkBridgeRepository } from '../IZkBridgeRepository';

@injectable()
export class ZkBridgeRepository implements IZkBridgeRepository {
  constructor() {}

  public async getBridgeAssetData({
    param,
    web3,
  }: {
    param: ParamBridgeAsset;
    web3: Web3;
  }): Promise<TransactionConfig> {
    const nonce = await web3.eth.getTransactionCount(param.senderAddress);
    const contractAddress = EthBridgeContract[param.fromChainName];
    // ABI: https://github.com/0xPolygonHermez/zkevm-bridge-ui/blob/7c84791d06770569d316f27d62c3989bef81be58/abis/bridge.json
    const contract = new web3.eth.Contract(ZK_EVM_BRIDGE_ABI as AbiItem[], contractAddress);

    const isToL1 =
      param.toChainName === EthBridgeNetworkName.Ethereum ||
      param.toChainName === EthBridgeNetworkName.Sepolia;

    // Todo: Ask if `0` is L1 and `1` is L1
    const destinationNetwork = isToL1 ? ZkNetworkId.L1 : ZkNetworkId.L2;
    const destinationAddress = param.senderAddress;
    const amount = ethers.utils.parseEther(String(param.amount)).toString();
    const token = astarNativeTokenErcAddr;

    // Todo: Ask if we need to care about `forceUpdateGlobalExitRoot` and `permitData`
    const forceUpdateGlobalExitRoot = true;
    const permitData = '0x';

    const data = contract.methods
      .bridgeAsset(
        destinationNetwork,
        destinationAddress,
        amount,
        token,
        forceUpdateGlobalExitRoot,
        permitData
      )
      .encodeABI();

    return {
      nonce,
      from: param.senderAddress,
      to: contractAddress,
      value: amount,
      data,
    };
  }
}
