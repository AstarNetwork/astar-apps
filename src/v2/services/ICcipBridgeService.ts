import { CcipChainId, CCIP_TOKEN } from 'src/modules/ccip-bridge';

export interface ICcipBridgeService {
  approve(param: ParamApproveCcip): Promise<string>;
  bridgeCcipAsset(param: ParamBridgeCcipAsset): Promise<string>;
  fetchFee(param: ParamBridgeCcipAsset): Promise<string>;
  fetchOutboundLimits(param: ParamFetchOutboundLimits): Promise<string>;
  dryRunBridgeAsset(param: ParamBridgeCcipAsset): Promise<{ isGasPayable: boolean; fee: number }>;
}

export interface ParamBridgeCcipAsset {
  senderAddress: string;
  amount: number;
  destNetworkId: CcipChainId;
  fromNetworkId: CcipChainId;
  tokenAddress: string;
  token: CCIP_TOKEN;
}

export interface ParamApproveCcip {
  contractAddress: string;
  tokenAddress: string;
  amount: string;
  senderAddress: string;
  fromChainId: CcipChainId;
}

export interface ParamFetchOutboundLimits {
  destNetworkId: CcipChainId;
  fromNetworkId: CcipChainId;
}
