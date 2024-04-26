import { LayerZeroId, LayerZeroToken } from 'src/modules/zk-evm-bridge';

export interface ILzBridgeService {
  approve(param: ParamBridgeLzAsset): Promise<String>;
  bridgeLzAsset(param: ParamBridgeLzAsset): Promise<String>;
}

export interface ParamBridgeLzAsset {
  senderAddress: string;
  amount: number;
  minAmount: number;
  destNetworkId: LayerZeroId;
  fromNetworkId: LayerZeroId;
  tokenAddress: string;
  isNativeToken: boolean;
  token: LayerZeroToken;
}
