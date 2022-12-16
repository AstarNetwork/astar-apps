import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { XvmAsset } from 'src/modules/token';
import { XvmGetAssetsParam, XvmTransferParam } from './../services/IXvmService';
export interface IXvmRepository {
  getAssets(param: XvmGetAssetsParam): Promise<XvmAsset[]>;
  getTransferCallData({
    token,
    senderAddress,
    finalizedCallback,
    recipientAddress,
    amount,
    isWasmErc20,
  }: XvmTransferParam): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>>;
}
