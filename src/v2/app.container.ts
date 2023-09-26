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
  IXvmRepository,
  IAssetsRepository,
  IPolkasafeRepository,
  IAccountsRepository,
  IIdentityRepository,
  INftRepository,
  IAccountUnificationRepository,
} from './repositories';
import {
  DappStakingRepository,
  EthCallRepository,
  MetadataRepository,
  SystemRepository,
  TokenApiRepository,
  XcmRepository,
  EvmAssetsRepository,
  AssetsRepository,
  PolkasafeRepository,
  AccountsRepository,
  BluezNftRepository,
  AccountUnificationRepository,
} from './repositories/implementations';
import {
  IBalanceFormatterService,
  IDappStakingService,
  IGasPriceProvider,
  IWalletService,
  IXcmEvmService,
  IXcmService,
  IEvmAssetsService,
  IAssetsService,
  WalletType,
  IXvmService,
  IAccountUnificationService,
  IIdentityService,
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
  EvmDappStakingService,
  AssetsService,
  AccountUnificationService,
  IdentityService,
} from './services/implementations';
import { Symbols } from './symbols';
import { IEventAggregator, EventAggregator } from './messaging';
import { container } from './common';
import { ITypeFactory, TypeFactory, TypeMapping } from './config/types';
import { XcmRepositoryConfiguration } from './config/xcm/XcmRepositoryConfiguration';
import { endpointKey } from 'src/config/chainEndpoints';
import { xcmToken, XcmTokenInformation } from 'src/modules/xcm';
import { XvmRepository } from 'src/v2/repositories/implementations/XvmRepository';
import { XvmService } from 'src/v2/services/implementations/XvmService';
import { IdentityRepository } from './repositories/implementations/IdentityRepository';

let currentWalletType = WalletType.Polkadot;
let currentWalletName = '';
// Todo: delete after we remove the lockdrop service
let isLockdropAccount = false;

export function setCurrentWallet(
  isEthWallet: boolean,
  currentWallet: string,
  isLockdrop: boolean
): void {
  currentWalletType = isEthWallet ? WalletType.Metamask : WalletType.Polkadot;
  currentWalletName = currentWallet;
  isLockdropAccount = isLockdrop;

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
    return (walletType?: WalletType) => {
      return container.get<IWalletService>(walletType ?? currentWalletType);
    };
  });

  // dApp Staking service factory
  container
    .bind<interfaces.Factory<IDappStakingService>>(Symbols.DappStakingServiceFactory)
    .toFactory(() => {
      return () =>
        container.get<IDappStakingService>(
          currentWalletType === WalletType.Polkadot || isLockdropAccount
            ? Symbols.DappStakingService
            : Symbols.EvmDappStakingService
        );
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
  container.addTransient<IPolkasafeRepository>(PolkasafeRepository, Symbols.PolkasafeRepository);
  container.addTransient<IXvmRepository>(XvmRepository, Symbols.XvmRepository);
  container.addTransient<IEvmAssetsRepository>(EvmAssetsRepository, Symbols.EvmAssetsRepository);
  container.addTransient<IAssetsRepository>(AssetsRepository, Symbols.AssetsRepository);
  container.addSingleton<IAccountsRepository>(AccountsRepository, Symbols.AccountsRepository);
  container.addSingleton<IIdentityRepository>(IdentityRepository, Symbols.IdentityRepository);
  container.addSingleton<INftRepository>(BluezNftRepository, Symbols.BluezNftRepository);
  container.addSingleton<IAccountUnificationRepository>(
    AccountUnificationRepository,
    Symbols.AccountUnificationRepository
  );

  // Services
  container.addTransient<IWalletService>(PolkadotWalletService, Symbols.PolkadotWalletService);
  container.addTransient<IWalletService>(PolkadotWalletService, Symbols.PolkadotWalletService);
  container.addTransient<IDappStakingService>(DappStakingService, Symbols.DappStakingService);
  container.addTransient<IDappStakingService>(EvmDappStakingService, Symbols.EvmDappStakingService);
  container.addSingleton<IGasPriceProvider>(GasPriceProvider, Symbols.GasPriceProvider); // Singleton because it listens and caches gas/tip prices.
  container.addTransient<IXcmService>(XcmService, Symbols.XcmService);
  container.addTransient<IXvmService>(XvmService, Symbols.XvmService);
  container.addTransient<IXcmEvmService>(XcmEvmService, Symbols.XcmEvmService);
  container.addTransient<IEvmAssetsService>(EvmAssetsService, Symbols.EvmAssetsService);
  container.addTransient<IBalanceFormatterService>(
    BalanceFormatterService,
    Symbols.BalanceFormatterService
  );
  container.addTransient<IAssetsService>(AssetsService, Symbols.AssetsService);
  container.addSingleton<IAccountUnificationService>(
    AccountUnificationService,
    Symbols.AccountUnificationService
  );
  container.addSingleton<IIdentityService>(IdentityService, Symbols.IdentityService);

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
