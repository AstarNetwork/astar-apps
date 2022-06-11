// import 'reflect-metadata';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { resetContainer, cid, container } from 'inversify-props';
import { IDappStakingService } from 'src/v2/services';
import { initTestContainer } from '../helpers';
import BN from 'bn.js';

describe('DappStakingService.ts', () => {
  beforeEach(() => {
    resetContainer();
    initTestContainer();
  });

  it('calculates TVL in USD', async () => {
    const sut = container.get<IDappStakingService>(cid.IDappStakingService);

    const tvl = await sut.getTvl();

    expect(tvl.tvlUsd).toStrictEqual(100000000000000);
  });

  // WIP see how to use mocks with the container.
  // it('stakes given amount to a contract', () => {
  //   const mocksignAndSend = jest.fn();
  //   jest.mock('src/v2/services/implementations/PolkadotWalletService', () => {
  //     return jest.fn().mockImplementation(() => {
  //       return { signAndSend: mocksignAndSend };
  //     });
  //   });

  //   const sut = container.get<IDappStakingService>(cid.IDappStakingService);

  //   sut.stake('123', '456', new BN(1));
  //   expect(mocksignAndSend).toBeCalledTimes(1);
  // });
});
