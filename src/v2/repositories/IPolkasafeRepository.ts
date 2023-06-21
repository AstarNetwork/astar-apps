import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';

export interface IPolkasafeRepository {
  sendMultisigTransaction(param: MultisigTransactionParam): Promise<any>;
}

export interface MultisigTransactionParam {
  multisigAddress: string;
  transaction: SubmittableExtrinsic<'promise', ISubmittableResult>;
}
