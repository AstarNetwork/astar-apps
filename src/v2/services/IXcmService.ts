import { Asset } from 'src/v2/models';

export interface IXcmService {
  getAssets(currentAccount: string): Promise<{ assets: Asset[]; ttlNativeXcmUsdAmount: number }>;
}
