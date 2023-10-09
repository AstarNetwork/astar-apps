import { ParamBridgeAsset } from 'src/v2/services';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';

export interface IZkBridgeRepository {
  getBridgeAssetData({
    param,
    web3,
  }: {
    param: ParamBridgeAsset;
    web3: Web3;
  }): Promise<TransactionConfig>;
}
