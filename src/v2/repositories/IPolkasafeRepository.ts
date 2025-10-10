import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { ApiPromise } from '@polkadot/api';

export interface IPolkasafeRepository {
  getMultisigTransaction(
    param: MultisigTransactionParam
  ): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>>;
}

export interface MultisigTransactionParam {
  multisigAddress: string;
  api: ApiPromise;
  transaction: SubmittableExtrinsic<'promise', ISubmittableResult>;
  proxyAddress: string;
}
