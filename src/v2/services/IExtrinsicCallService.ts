import { ISubmittableResult } from '@polkadot/types/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import { EcdsaAccount } from 'src/store/general/state';

export interface IExtrinsicCallService {
  callCustomExtrinsic(
    method: SubmittableExtrinsic<'promise'>,
    currentEcdsaAccount: EcdsaAccount,
    currentNetworkIdx: number,
    requestSignature: (message: string, account: string) => Promise<string>
  ): Promise<void>;

  send(
    extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>,
    successMessage?: string
  ): Promise<string | null>;
}
