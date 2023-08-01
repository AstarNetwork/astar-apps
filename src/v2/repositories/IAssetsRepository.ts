import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { ParamAssetTransfer, ParamEvmTransfer, ParamEvmWithdraw } from 'src/v2/services';
import { TransactionConfig } from 'web3-eth';
import Web3 from 'web3';

export interface IAssetsRepository {
  getNativeTransferCall(
    param: ParamAssetTransfer
  ): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>>;
  getEvmTransferData({
    param,
    web3,
  }: {
    param: ParamEvmTransfer;
    web3: Web3;
  }): Promise<TransactionConfig>;
  getEvmWithdrawCall(
    param: ParamEvmWithdraw
  ): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>>;
  getVestCall(): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>>;
  getNativeBalance(address: string): Promise<string>;
}
