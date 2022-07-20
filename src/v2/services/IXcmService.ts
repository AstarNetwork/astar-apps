import { XcmAssets } from './../../store/assets/state';

export interface IXcmService {
  getAssets(currentAccount: string): Promise<XcmAssets>;
}
