import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { AssetTransferParam, EvmTransferParam } from 'src/v2/services';
import { TransactionConfig } from 'web3-eth';
import Web3 from 'web3';

export interface IAssetsRepository {
  getNativeTransferCall(
    param: AssetTransferParam
  ): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>>;
  getEvmTransferData({
    param,
    web3,
  }: {
    param: EvmTransferParam;
    web3: Web3;
  }): Promise<TransactionConfig>;
}
