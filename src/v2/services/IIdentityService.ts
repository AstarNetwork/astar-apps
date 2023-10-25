import { IdentityData } from '../models';

export interface IIdentityService {
  setIdentity(address: string, data: IdentityData): Promise<void>;
  createIdentityData(
    display: string,
    avatarNftAddress?: string,
    avatarNftId?: string
  ): IdentityData;
}
