import { LayerZeroChainId, LayerZeroId, LayerZeroToken } from 'src/modules/zk-evm-bridge';

export interface ILzBridgeService {
  approve(param: ParamApprove): Promise<string>;
  bridgeLzAsset(param: ParamBridgeLzAsset): Promise<string>;
  dryRunBridgeAsset(param: ParamBridgeLzAsset): Promise<{ isGasPayable: boolean; fee: number }>;
}

export interface ParamBridgeLzAsset {
  senderAddress: string;
  amount: number;
  minAmount: number;
  destNetworkId: LayerZeroId;
  fromNetworkId: LayerZeroId;
  fromChainId: LayerZeroChainId;
  tokenAddress: string;
  isNativeToken: boolean;
  token: LayerZeroToken;
}

export interface ParamApprove {
  contractAddress: string;
  tokenAddress: string;
  amount: string;
  senderAddress: string;
  fromChainId: LayerZeroChainId;
}
