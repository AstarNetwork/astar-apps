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
  IEvmAssetsRepository,
} from './repositories';
import {
  DappStakingRepository,
  EthCallRepository,
  MetadataRepository,
  SystemRepository,
  TokenApiRepository,
  XcmRepository,
  EvmAssetsRepository,
} from './repositories/implementations';
import {
  IBalanceFormatterService,
  IDappStakingService,
  IGasPriceProvider,
  IWalletService,
  IXcmEvmService,
  IXcmService,
  IEvmAssetsService,
  WalletType,
} from './services';
import {
  DappStakingService,
  PolkadotWalletService,
  MetamaskWalletService,
  GasPriceProvider,
  XcmService,
  EvmAssetsService,
  BalanceFormatterService,
  XcmEvmService,
} from './services/implementations';
import { Symbols } from './symbols';
import { IEventAggregator, EventAggregator } from './messaging';
import { container } from './common';
import { ITypeFactory, TypeFactory, TypeMapping } from './config/types';
import { XcmRepositoryConfiguration } from './config/xcm/XcmRepositoryConfiguration';
import { endpointKey } from 'src/config/chainEndpoints';
import { xcmToken, XcmTokenInformation } from 'src/modules/xcm';

let currentWalletType = WalletType.Polkadot;
let currentWalletName = '';

export function setCurrentWallet(isEthWallet: boolean, currentWallet: string): void {
  currentWalletType = isEthWallet ? WalletType.Metamask : WalletType.Polkadot;
  currentWalletName = currentWallet;

  container.removeConstant(Symbols.CurrentWallet);
  container.addConstant<string>(Symbols.CurrentWallet, currentWalletName);
}

export default function buildDependencyContainer(network: endpointKey): void {
  container.addConstant<XcmTokenInformation[]>(Symbols.RegisteredTokens, xcmToken[network]);
  container.addConstant<string>(Symbols.CurrentWallet, currentWalletName);

  container.addSingleton<IEventAggregator>(EventAggregator, Symbols.EventAggregator);
  container.addSingleton<IApi>(DefaultApi, Symbols.DefaultApi);
  container.addSingleton<IApiFactory>(ApiFactory, Symbols.ApiFactory);

  // Wallets
  container.addSingleton<IWalletService>(PolkadotWalletService, WalletType.Polkadot);
  container.addSingleton<IWalletService>(MetamaskWalletService, WalletType.Metamask);

  // Wallet factory
  container.bind<interfaces.Factory<IWalletService>>(Symbols.WalletFactory).toFactory(() => {
    return () => {
      return container.get<IWalletService>(currentWalletType);
    };
  });

  // Repositories
  container.addSingleton<IDappStakingRepository>(
    DappStakingRepository,
    Symbols.DappStakingRepository
  );

  container.addTransient<IPriceRepository>(TokenApiRepository, Symbols.PriceRepository);
  container.addTransient<IMetadataRepository>(MetadataRepository, Symbols.MetadataRepository);
  container.addTransient<ISystemRepository>(SystemRepository, Symbols.SystemRepository);
  container.addTransient<IEthCallRepository>(EthCallRepository, Symbols.EthCallRepository);
  container.addTransient<IXcmRepository>(XcmRepository, Symbols.XcmRepository);
  container.addTransient<IEvmAssetsRepository>(EvmAssetsRepository, Symbols.EvmAssetsRepository);

  // Services
  container.addTransient<IDappStakingService>(DappStakingService, Symbols.DappStakingService);
  container.addSingleton<IGasPriceProvider>(GasPriceProvider, Symbols.GasPriceProvider); // Singleton because it listens and caches gas/tip prices.
  container.addTransient<IXcmService>(XcmService, Symbols.XcmService);
  container.addTransient<IXcmEvmService>(XcmEvmService, Symbols.XcmEvmService);
  container.addTransient<IEvmAssetsService>(EvmAssetsService, Symbols.EvmAssetsService);
  container.addTransient<IBalanceFormatterService>(
    BalanceFormatterService,
    Symbols.BalanceFormatterService
  );

  // const typeMappings = XcmConfiguration.reduce(
  //   (result, { networkAlias, repository }) => ({ ...result, [networkAlias]: repository }),
  //   {} as TypeMapping
  // );

  // Type factory
  container.addConstant<TypeMapping>(Symbols.TypeMappings, XcmRepositoryConfiguration);
  container.addSingleton<ITypeFactory>(TypeFactory, Symbols.TypeFactory);

  // const factory = container.get<ITypeFactory>(Symbols.TypeFactory);
  // const repo = factory.getInstance('Acala');

  // Create GasPriceProvider instace so it can catch price change messages from the portal.
  container.get<IGasPriceProvider>(Symbols.GasPriceProvider);
}
