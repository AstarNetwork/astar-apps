import { BridgeHistory, EthBridgeNetworkName } from 'src/modules/zk-evm-bridge';

export interface IZkBridgeService {
  bridgeAsset(param: ParamBridgeAsset): Promise<String>;
  claimAsset(param: ParamClaim): Promise<String>;
}

export interface ParamBridgeAsset {
  senderAddress: string;
  amount: string;
  fromChainName: EthBridgeNetworkName;
  toChainName: EthBridgeNetworkName;
  tokenAddress: string;
}

export interface ParamClaim {
  senderAddress: string;
  withdrawal: BridgeHistory;
}
