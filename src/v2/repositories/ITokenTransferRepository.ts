import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { NativeTokenTransferParam } from 'src/v2/services';

export interface ITokenTransferRepository {
  getTransferNativeTokenCall(
    param: NativeTokenTransferParam
  ): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>>;
}
