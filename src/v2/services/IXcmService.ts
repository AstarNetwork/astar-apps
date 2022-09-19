import { XcmAssets } from 'src/store/assets/state';

export interface IXcmService {
  getAssets(currentAccount: string, isFetchUsd: boolean): Promise<XcmAssets>;
}
