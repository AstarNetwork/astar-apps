import { Erc20Token } from 'src/modules/token';

export interface IEvmAssetsRepository {
  getAssets(
    currentAccount: string,
    srcChainId: number,
    currentNetworkIdx: number,
    isFetchUsd: boolean
  ): Promise<Erc20Token[]>;
}
