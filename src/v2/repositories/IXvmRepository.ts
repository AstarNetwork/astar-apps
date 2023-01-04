import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { Erc20Token } from 'src/modules/token';
import { XvmGetAssetsParam, XvmTransferParam } from './../services/IXvmService';
export interface IXvmRepository {
  getAssets(param: XvmGetAssetsParam): Promise<Erc20Token[]>;
  getTransferCallData({
    token,
    senderAddress,
    finalizedCallback,
    recipientAddress,
    amount,
  }: XvmTransferParam): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>>;
}
