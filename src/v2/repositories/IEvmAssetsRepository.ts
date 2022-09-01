import { EvmAsset } from 'src/c-bridge';

export interface IEvmAssetsRepository {
  getAssets(
    currentAccount: string,
    srcChainId: number,
    currentNetworkIdx: number,
    isFetchUsd: boolean
  ): Promise<EvmAsset[]>;
}
