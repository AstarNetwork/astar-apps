import { IdentityData } from '../models';

export interface IIdentityService {
  setIdentity(address: string, data: IdentityData): Promise<void>;
}
