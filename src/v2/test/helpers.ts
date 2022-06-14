import 'reflect-metadata';
import { interfaces } from 'inversify';
import { IDappStakingRepository, IMetadataRepository, IPriceRepository } from 'src/v2/repositories';
import { DappStakingRepositoryMock } from 'src/v2/test/mocks/repositories/DappStakingRepositoryMock';
import { PriceRepositoryMock } from './mocks/repositories/PriceRepositoryMock';
import { MetadataRepositoryMock } from './mocks/repositories/MetadataRepositoryMock';
import {
  IDappStakingService,
  IGasPriceProvider,
  IWalletService,
  WalletType,
} from 'src/v2/services';
import {
  DappStakingService,
  GasPriceProvider,
  PolkadotWalletService,
} from 'src/v2/services/implementations';
import { Symbols } from 'src/v2/symbols';
import { EventAggregator, IEventAggregator } from 'src/v2/messaging';
import { container } from '../common';
import { WalletServiceMock } from './mocks/services/WalletServiceMock';

const TestSymbols = {
  WalletServiceMock: Symbol.for('WalletServiceMock'),
};

const initTestContainer = () => {
  container.addSingleton<IEventAggregator>(EventAggregator);
  container.addSingleton<IGasPriceProvider>(GasPriceProvider);
  container.addSingleton<IDappStakingRepository>(
    DappStakingRepositoryMock,
    Symbols.DappStakingRepository
  );
  container.addSingleton<IPriceRepository>(PriceRepositoryMock, Symbols.CoinGecko);
  container.addSingleton<IMetadataRepository>(MetadataRepositoryMock, Symbols.MetadataRepository);
  container.addSingleton<IDappStakingService>(DappStakingService);
  container.addSingleton<IWalletService>(WalletServiceMock);

  // Wallet factory
  container.bind<interfaces.Factory<IWalletService>>(Symbols.WalletFactory).toFactory(() => {
    return () => {
      return container.get<IWalletService>(TestSymbols.WalletServiceMock);
    };
  });
};

export { initTestContainer, TestSymbols };
