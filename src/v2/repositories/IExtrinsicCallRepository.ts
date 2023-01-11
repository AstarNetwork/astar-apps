import { ISubmittableResult } from '@polkadot/types/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import { EcdsaAccount } from 'src/store/general/state';

export interface IExtrinsicCallRepository {
  getCallFunc(
    method: SubmittableExtrinsic<'promise', ISubmittableResult>,
    currentEcdsaAccount: EcdsaAccount,
    currentNetworkIdx: number,
    requestSignature: (message: string, account: string) => Promise<string>
  ): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>>;
}
