import { EvmAssets } from './../../store/assets/state';

export interface IEvmAssetsService {
  getAssets(
    currentAccount: string,
    srcChainId: number,
    currentNetworkIdx: number,
    isFetchUsd: boolean
  ): Promise<EvmAssets>;
}
