import { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';

export type BatchTxs = SubmittableExtrinsic<'promise', ISubmittableResult>[];
