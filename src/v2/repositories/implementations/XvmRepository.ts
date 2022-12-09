import { inject, injectable } from 'inversify';
import { buildEvmAddress } from 'src/config/web3';
import { Erc20Token, getStoredXvmTokens } from 'src/modules/token';
import { IXvmRepository } from 'src/v2/repositories';
import { IEvmAssetsRepository } from 'src/v2/repositories/IEvmAssetsRepository';
import { Symbols } from 'src/v2/symbols';
import { XvmGetAssetsParam } from './../../services/IXvmService';

export const ASTAR_ADDRESS_PREFIX = 5;

@injectable()
export class XvmRepository implements IXvmRepository {
  constructor(
    @inject(Symbols.EvmAssetsRepository) private evmAssetsRepository: IEvmAssetsRepository
  ) {}

  public async getAssets({
    currentAccount,
    srcChainId,
    isFetchUsd,
  }: XvmGetAssetsParam): Promise<any[]> {
    const xvmAssets = getStoredXvmTokens();
    const assets = xvmAssets.filter((it) => it.srcChainId === srcChainId);
    const userAddress = buildEvmAddress(currentAccount);

    const result = await Promise.all(
      assets.map(async (item) => {
        const token: Erc20Token = {
          srcChainId: item.srcChainId,
          address: item.erc20Contract,
          decimal: item.decimal,
          symbol: item.symbol,
          name: item.name,
          image: '',
          isWrappedToken: false,
          isXC20: false,
          wrapUrl: null,
        };

        const { balUsd, userBalance } = await this.evmAssetsRepository.updateTokenBalanceHandler({
          userAddress,
          token,
          isFetchUsd,
          srcChainId,
        });
        return {
          ...item,
          userBalance,
          userBalanceUsd: String(balUsd),
        };
      })
    );

    return result;
  }
}
