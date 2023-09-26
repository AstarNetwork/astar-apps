import { ExtrinsicPayload } from 'src/v2/integration';
import { IdentityData } from 'src/v2/models';

/**
 * Definition of repository to support account unification.
 */
export interface IAccountUnificationRepository {
  /**
   * Gets batch all call to unify accounts and to set the account identity.
   * @param nativeAddress Native address to unify.
   * @param evmAddress EVM address to unify.
   * @param signature Signature of the payload (SS58 address) signed by the EVM address.
   * @param identityInfo Identity info to set.
   * @returns Batch all call to unify accounts and to set the account identity.
   */
  getUnifyAccountsBatchAllCall(
    nativeAddress: string,
    evmAddress: string,
    signature: string,
    identityInfo: IdentityData
  ): Promise<ExtrinsicPayload>;
}
