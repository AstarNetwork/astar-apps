import { ExtrinsicPayload } from 'src/v2/integration';
import { IdentityData } from 'src/v2/models';

/**
 * Definition of repository to support account unification.
 */
export interface IAccountUnificationRepository {
  /**
   * Gets call to unify EVM and SS58 addresses.
   * @param evmAddress EVM address to claim.
   * @param signature Signature of the payload (SS58 address) signed by the EVM address.
   * @returns Call to claim EVM address.
   */
  getClaimEvmAccountCall(evmAddress: string, signature: string): Promise<ExtrinsicPayload>;

  /**
   * Gets mapped native address for the given EVM address.
   * @param evmAddress EVM address to get mapped native address.
   */
  getMappedNativeAddress(evmAddress: string): Promise<string>;

  /**
   * Gets mapped EVM address for the given native address.
   * @param nativeAddress Native address to get mapped EVM address.
   */
  getMappedEvmAddress(nativeAddress: string): Promise<string>;

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
