import { SubmittableExtrinsic } from '@polkadot/api/types';

export * from './IApi';
export * from './IApiFactory';

export type ExtrinsicPayload = SubmittableExtrinsic<'promise'>;
