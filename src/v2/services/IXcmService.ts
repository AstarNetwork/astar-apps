import { Asset } from 'src/v2/models';
import { Network } from '../config/types';

export interface IXcmService {
  getAssets(currentAccount: string): Promise<Asset[]>;
  transfer(from: Network, to: Network, token: Asset, amount: number): Promise<void>;
}
