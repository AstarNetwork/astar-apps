import { ExtrinsicPayload } from 'src/v2/integration';
import { Deposit, IdentityData } from 'src/v2/models';

export interface IIdentityRepository {
  getDepositInfo(): Promise<Deposit>;
  getIdentity(address: string): Promise<IdentityData | undefined>;
  getSetIdentityCall(address: string, data: IdentityData): Promise<ExtrinsicPayload>;
}
