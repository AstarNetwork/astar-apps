import type Web3 from 'web3';
import type { TransactionConfig } from 'web3-eth';
import type {
  ParamApproveCcip,
  ParamBridgeCcipAsset,
  ParamFetchOutboundLimits,
} from '../services/ICcipBridgeService';

export interface ICcipBridgeRepository {
  getApproveData({
    param,
    web3,
  }: {
    param: ParamApproveCcip;
    web3: Web3;
  }): Promise<TransactionConfig>;

  getBridgeCcipAssetData({
    param,
    web3,
  }: {
    param: ParamBridgeCcipAsset;
    web3: Web3;
  }): Promise<{ txParam: TransactionConfig; nativeFee: number }>;

  getFee({ param, web3 }: { param: ParamBridgeCcipAsset; web3: Web3 }): Promise<string>;
  getOutboundLimits({
    param,
    web3,
  }: {
    param: ParamFetchOutboundLimits;
    web3: Web3;
  }): Promise<string>;
}
