import { inject, injectable } from 'inversify';
import { Guard } from 'src/v2/common';
import { IEvmAssetsService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { EvmAssets } from './../../../store/assets/state';
import { IEvmAssetsRepository } from './../../repositories/IEvmAssetsRepository';

@injectable()
export class EvmAssetsService implements IEvmAssetsService {
  constructor(
    @inject(Symbols.EvmAssetsRepository) private evmAssetRepository: IEvmAssetsRepository
  ) {}

  public async getAssets(
    currentAccount: string,
    srcChainId: number,
    currentNetworkIdx: number,
    isFetchUsd: boolean
  ): Promise<EvmAssets> {
    Guard.ThrowIfUndefined('currentAccount', currentAccount);
    Guard.ThrowIfUndefined('srcChainId', srcChainId);

    const assets = await this.evmAssetRepository.getAssets(
      currentAccount,
      srcChainId,
      currentNetworkIdx,
      isFetchUsd
    );
    let ttlEvmUsdAmount = 0;

    assets.forEach((it) => {
      if (it.userBalanceUsd) {
        ttlEvmUsdAmount += Number(it.userBalanceUsd);
      }
    });
    return { assets: assets, ttlEvmUsdAmount };
  }
}
