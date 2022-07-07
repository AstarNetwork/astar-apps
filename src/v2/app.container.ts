import 'reflect-metadata';
import { interfaces } from 'inversify';
import { IApi, IApiFactory } from './integration';
import { ApiFactory, DefaultApi } from './integration/implementation';
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
  DiaDataPriceRepository,
  EthCallRepository,
  MetadataRepository,
  PriceRepositoryWithFailover,
  SystemRepository,
  XcmRepository,
} from './repositories/implementations';
import {
  IBalanceFormatterService,
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
  BalanceFormatterService,
} from './services/implementations';
import { Symbols } from './symbols';
import { IEventAggregator, EventAggregator } from './messaging';
import { container } from './common';
import { ITypeFactory, TypeFactory, TypeMapping } from './config/types';
import { XcmConfiguration } from './config/xcm/XcmConfiguration';

let currentWallet = WalletType.Polkadot;

export function setCurrentWallet(isEthWallet: boolean): void {
  currentWallet = isEthWallet ? WalletType.Metamask : WalletType.Polkadot;
}

export default function buildDependencyContainer(): void {
  container.addSingleton<IEventAggregator>(EventAggregator, Symbols.EventAggregator);
  container.addSingleton<IApi>(DefaultApi, Symbols.DefaultApi);
  container.addSingleton<IApiFactory>(ApiFactory, Symbols.ApiFactory);

  // Wallets
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

  // container.getAll will follow registration order. In our case DIA repository will be first in the list.
  // Feel free to implement aditional price repositories if needed.
  container.addTransient<IPriceRepository>(DiaDataPriceRepository, Symbols.PriceRepository);
  container.addTransient<IPriceRepository>(CoinGeckoPriceRepository, Symbols.PriceRepository);

  container.addTransient<IPriceRepository>(
    PriceRepositoryWithFailover,
    Symbols.PriceRepositoryWithFailover
  );
  container.addTransient<IMetadataRepository>(MetadataRepository, Symbols.MetadataRepository);
  container.addTransient<ISystemRepository>(SystemRepository, Symbols.SystemRepository);
  container.addTransient<IEthCallRepository>(EthCallRepository, Symbols.EthCallRepository);
  container.addTransient<IXcmRepository>(XcmRepository, Symbols.XcmRepository);

  // Services
  container.addTransient<IDappStakingService>(DappStakingService, Symbols.DappStakingService);
  container.addSingleton<IGasPriceProvider>(GasPriceProvider, Symbols.GasPriceProvider); // Singleton because it listens and caches gas/tip prices.
  container.addTransient<IXcmService>(XcmService, Symbols.XcmService);
  container.addTransient<IBalanceFormatterService>(
    BalanceFormatterService,
    Symbols.BalanceFormatterService
  );

  // TypeFactory. Define typeMappings here that can be used by TypeFactory later to provide a rquired type instance.
  const typeMappings = XcmConfiguration.reduce(
    (result, { networkAlias, repository }) => ({ ...result, [networkAlias]: repository }),
    {} as TypeMapping
  );

  container.addConstant<TypeMapping>(Symbols.TypeMappings, typeMappings);
  container.addSingleton<ITypeFactory>(TypeFactory, Symbols.TypeFactory);

  // Create GasPriceProvider instace so it can catch price change messages from the portal.
  container.get<IGasPriceProvider>(Symbols.GasPriceProvider);
}
