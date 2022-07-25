import { XcmAssets } from 'src/store/assets/state';

export interface IXcmService {
  getAssets(currentAccount: string): Promise<XcmAssets>;
}
