import { ExtrinsicPayload } from 'src/v2/integration';

/**
 * Definition of repository to interact with Accounts pallet.
 */
export interface IAccountsRepository {
  getClaimEvmAccountCall(h160Address: string, signature: string): Promise<ExtrinsicPayload>;
}
