import { ExtrinsicPayload } from 'src/v2/integration';
import { IdentityData } from 'src/v2/models';

export interface IIdentityRepository {
  getIdentity(address: string): Promise<IdentityData>;
  getSetIdentityCall(address: string, data: IdentityData): Promise<ExtrinsicPayload>;
}
