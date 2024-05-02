import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { ParamApprove, ParamBridgeLzAsset } from '../services/ILzBridgeService';

export interface ILzBridgeRepository {
  getApproveData({ param, web3 }: { param: ParamApprove; web3: Web3 }): Promise<TransactionConfig>;

  getBridgeLzAssetData({
    param,
    web3,
  }: {
    param: ParamBridgeLzAsset;
    web3: Web3;
  }): Promise<{ txParam: TransactionConfig; nativeFee: number }>;
}
