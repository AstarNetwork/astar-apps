import { ExtrinsicPayload } from 'src/v2/integration';

/**
 * Definition of repository to interact with Accounts pallet.
 */
export interface IAccountsRepository {
  getClaimEvmAccountCall(evmAddress: string, signature: string): Promise<ExtrinsicPayload>;
  getMappedNativeAddress(evmAddress: string): Promise<string>;
  getMappedEvmAddress(nativeAddress: string): Promise<string>;
}
