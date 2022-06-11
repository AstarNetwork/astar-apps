import 'reflect-metadata';
import { interfaces } from 'inversify';
import { cid, container } from 'inversify-props';
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

const initTestContainer = () => {
  container.addSingleton<IEventAggregator>(EventAggregator);
  container.addSingleton<IGasPriceProvider>(GasPriceProvider);
  container.addSingleton<IDappStakingRepository>(
    DappStakingRepositoryMock,
    cid.IDappStakingRepository
  );
  container.addSingleton<IPriceRepository>(PriceRepositoryMock, Symbols.CoinGecko);
  container.addSingleton<IMetadataRepository>(MetadataRepositoryMock, cid.IMetadataRepository);
  container.addSingleton<IWalletService>(PolkadotWalletService, WalletType.Polkadot);
  container.addSingleton<IDappStakingService>(DappStakingService);
  // Wallet factory
  container.bind<interfaces.Factory<IWalletService>>(Symbols.WalletFactory).toFactory(() => {
    return () => {
      return container.get<IWalletService>(WalletType.Polkadot);
    };
  });
};

export { initTestContainer };
