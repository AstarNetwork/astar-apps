import { Asset } from 'src/v2/models';

export interface IXcmRepository {
  getAssets(currentAccount: string): Promise<Asset[]>;
}
