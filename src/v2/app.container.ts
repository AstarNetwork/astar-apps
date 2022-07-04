import 'reflect-metadata';
import { interfaces } from 'inversify';
import { IApi } from './integration';
import { Api } from './integration/implementation';
import {
  IDappStakingRepository,
  IEthCallRepository,
  IMetadataRepository,
  IPriceRepository,
  ISystemRepository,
  IXcmRepository,
} from './repositories';
import {
  CoinGeckoPriceRepository,
  DappStakingRepository,
  EthCallRepository,
  MetadataRepository,
  SystemRepository,
  XcmRepository,
} from './repositories/implementations';
import {
  IDappStakingService,
  IGasPriceProvider,
  IWalletService,
  IXcmService,
  WalletType,
} from './services';
import {
  DappStakingService,
  PolkadotWalletService,
  MetamaskWalletService,
  GasPriceProvider,
  XcmService,
} from './services/implementations';
import { Symbols } from './symbols';
import { IEventAggregator, EventAggregator } from './messaging';
import { container } from './common';

let currentWallet = WalletType.Polkadot;

export function setCurrentWallet(isEthWallet: boolean): void {
  currentWallet = isEthWallet ? WalletType.Metamask : WalletType.Polkadot;
}

export default function buildDependencyContainer(): void {
  container.addSingleton<IEventAggregator>(EventAggregator, Symbols.EventAggregator);
  container.addSingleton<IApi>(Api, Symbols.Api);

  // need to specify id because not following name convention IService -> Service
  container.addSingleton<IWalletService>(PolkadotWalletService, WalletType.Polkadot);
  container.addSingleton<IWalletService>(MetamaskWalletService, WalletType.Metamask);

  // Wallet factory
  container.bind<interfaces.Factory<IWalletService>>(Symbols.WalletFactory).toFactory(() => {
    return () => {
      return container.get<IWalletService>(currentWallet);
    };
  });

  // Repositories
  container.addSingleton<IDappStakingRepository>(
    DappStakingRepository,
    Symbols.DappStakingRepository
  );
  container.addTransient<IPriceRepository>(CoinGeckoPriceRepository, Symbols.CoinGecko);
  container.addTransient<IMetadataRepository>(MetadataRepository, Symbols.MetadataRepository);
  container.addTransient<ISystemRepository>(SystemRepository, Symbols.SystemRepository);
  container.addTransient<IEthCallRepository>(EthCallRepository, Symbols.EthCallRepository);
  container.addTransient<IXcmRepository>(XcmRepository, Symbols.XcmRepository);

  // Services
  container.addTransient<IDappStakingService>(DappStakingService, Symbols.DappStakingService);
  container.addSingleton<IGasPriceProvider>(GasPriceProvider, Symbols.GasPriceProvider); // Singleton because it listens and caches gas/tip prices.
  container.addTransient<IXcmService>(XcmService, Symbols.XcmService);

  // Create GasPriceProvider instace so it can catch price change messages from the portal.
  container.get<IGasPriceProvider>(Symbols.GasPriceProvider);
}
