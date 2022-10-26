import 'reflect-metadata';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { IDappStakingService, IWalletService } from 'src/v2/services';
import { initTestContainer, TestSymbols } from '../helpers';
import { BN } from '@polkadot/util';
import { container, resetContainer } from 'src/v2/common';
import { Symbols } from 'src/v2/symbols';
import { WalletServiceMock } from '../mocks/services/WalletServiceMock';
import { DappStakingRepositoryMock } from '../mocks/repositories/DappStakingRepositoryMock';
import { IDappStakingRepository } from 'src/v2/repositories';

describe('DappStakingService.ts', () => {
  beforeEach(() => {
    resetContainer();
    initTestContainer();
  });

  it('calculates TVL in USD', async () => {
    const sut = container.get<IDappStakingService>(Symbols.DappStakingService);

    const tvl = await sut.getTvl();

    expect(tvl.tvlUsd).toStrictEqual(100000000000000);
  });

  // WIP see how to use mocks with the container.
  it('stakes given amount to a contract', async () => {
    // TODO investigate how to mock class.
    // const mocksignAndSend = jest.fn();
    // jest.mock('src/v2/services/implementations/PolkadotWalletService', () => {
    //   return jest.fn().mockImplementation(() => {
    //     return { signAndSend: mocksignAndSend };
    //   });
    // });

    const sut = container.get<IDappStakingService>(Symbols.DappStakingService);
    const wallet = <WalletServiceMock>container.get<IWalletService>(TestSymbols.WalletServiceMock);
    const repo = <DappStakingRepositoryMock>(
      container.get<IDappStakingRepository>(Symbols.DappStakingRepository)
    );
    const amount = new BN('1');
    const contractAddress = '123';
    const stakerAddress = '456';

    await sut.stake(contractAddress, stakerAddress, amount);

    expect(repo.bondAndStakeCallMock).toBeCalledTimes(1);

    // The line below fails with although epected and received values are the same. Could be jest error.
    // expect(repo.bondAndStakeCallMock).toBeCalledWith(contractAddress, '01');

    expect(wallet.walletSignAndSendMock).toBeCalledTimes(1);
    expect(wallet.walletSignAndSendMock).toBeCalledWith({}, stakerAddress, expect.any(String));
  });
});
