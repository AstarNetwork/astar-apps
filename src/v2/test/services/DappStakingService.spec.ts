import 'reflect-metadata';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { resetContainer, cid, container } from 'inversify-props';
import { IDappStakingRepository, IMetadataRepository, IPriceRepository } from 'src/v2/repositories';
import { DappStakingRepositoryMock } from 'src/v2/test/mocks/repositories/DappStakingRepositoryMock';
import { PriceRepositoryMock } from '../mocks/repositories/PriceRepositoryMock';
import { MetadataRepositoryMock } from '../mocks/repositories/MetadataRepositoryMock';
import { IDappStakingService } from 'src/v2/services';
import { DappStakingService } from 'src/v2/services/implementations';
import { Symbols } from 'src/v2/symbols';

describe('DappStakingService.ts', () => {
  beforeEach(() => {
    resetContainer();
    container.addSingleton<IDappStakingRepository>(
      DappStakingRepositoryMock,
      cid.IDappStakingRepository
    );

    container.addSingleton<IPriceRepository>(PriceRepositoryMock, Symbols.CoinGecko);
    container.addSingleton<IMetadataRepository>(MetadataRepositoryMock, cid.IMetadataRepository);
    container.addSingleton<IDappStakingService>(DappStakingService);
  });

  it('calculates TVL in USD', async () => {
    const sut = container.get<IDappStakingService>(cid.IDappStakingService);

    const tvl = await sut.getTvl();

    expect(tvl.tvlUsd).toStrictEqual(100000000000000);
  });
});
