import { EvmChain } from 'src/c-bridge';
import { Erc20Token } from 'src/modules/token';

export interface IEvmAssetsRepository {
  getAssets(
    currentAccount: string,
    srcChainId: number,
    currentNetworkIdx: number,
    isFetchUsd: boolean
  ): Promise<Erc20Token[]>;
  updateTokenBalanceHandler({
    userAddress,
    token,
    isFetchUsd,
    srcChainId,
  }: {
    userAddress: string;
    token: Erc20Token;
    isFetchUsd: Boolean;
    srcChainId: EvmChain;
  }): Promise<{
    balUsd: number;
    userBalance: string;
  }>;
}
