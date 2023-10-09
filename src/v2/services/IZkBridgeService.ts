import { EthBridgeNetworkName } from 'src/modules/zk-evm-bridge';

export interface IZkBridgeService {
  bridgeAsset(param: ParamBridgeAsset): Promise<String>;
}

export interface ParamBridgeAsset {
  senderAddress: string;
  amount: string;
  fromChainName: EthBridgeNetworkName;
  toChainName: EthBridgeNetworkName;
}
