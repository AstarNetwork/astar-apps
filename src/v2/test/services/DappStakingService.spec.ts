import 'reflect-metadata';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { Container } from 'inversify';
import { IDappStakingRepository, IMetadataRepository, IPriceRepository } from 'src/v2/repositories';
import { DappStakingRepositoryMock } from 'src/v2/test/mocks/repositories/DappStakingRepositoryMock';
import { PriceRepositoryMock } from '../mocks/repositories/PriceRepositoryMock';
import { MetadataRepositoryMock } from '../mocks/repositories/MetadataRepositoryMock';
import { IDappStakingService } from 'src/v2/services';
import { DappStakingService } from 'src/v2/services/implementations';
import { Symbols } from 'src/v2/symbols';

describe('DappStakingService.ts', () => {
  let sut: IDappStakingService;

  beforeEach(() => {
    sut = new DappStakingService(
      new DappStakingRepositoryMock(),
      new PriceRepositoryMock(),
      new MetadataRepositoryMock()
    );
  });

  it('calculates TVL in USD', async () => {
    const tvl = await sut.getTvl();

    expect(tvl.tvlUsd).toStrictEqual(100000000000000);
  });
});
