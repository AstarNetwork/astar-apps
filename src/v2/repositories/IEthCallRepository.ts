import { ISubmittableResult } from '@polkadot/types/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import { BN } from '@polkadot/util';

/**
 * Definition of repository for accessing ethCall pallet.
 */
export interface IEthCallRepository {
  /**
   * Gets eth call.
   */
  getCall(
    extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>,
    senderAddress: string,
    signature: string,
    nonce: BN
  ): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>>;

  /**
   * Gets payload to sign for ETH call.
   */
  getPayload(method: SubmittableExtrinsic<'promise'>, nonce: BN, networkPrefix: number): string;
}
