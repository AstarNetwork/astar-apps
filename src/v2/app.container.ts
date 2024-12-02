import { interfaces } from 'inversify';
import 'reflect-metadata';
import { endpointKey } from 'src/config/chainEndpoints';
import { XcmTokenInformation, xcmToken } from 'src/modules/xcm';
import {
  DappStakingRepository as DappStakingRepositoryV3,
  DappStakingServiceEvm as DappStakingServiceEvmV3,
  DappStakingService as DappStakingServiceV3,
  IDappStakingRepository as IDappStakingRepositoryV3,
  IDappStakingService as IDappStakingServiceV3,
} from 'src/staking-v3';
import { XvmRepository } from 'src/v2/repositories/implementations/XvmRepository';
import { XvmService } from 'src/v2/services/implementations/XvmService';
import {
  DappStakingServiceV2Ledger,
  IDappStakingServiceV2Ledger,
  IDataProviderRepository,
  TokenApiProviderRepository,
} from '../staking-v3/logic';
import { container } from './common';
import { ITypeFactory, TypeFactory, TypeMapping } from './config/types';
import { XcmRepositoryConfiguration } from './config/xcm/XcmRepositoryConfiguration';
import { IApi, IApiFactory } from './integration';
import { ApiFactory, DefaultApi } from './integration/implementation';
import { EventAggregator, IEventAggregator } from './messaging';
import {
  IAccountUnificationRepository,
  IAssetsRepository,
  IEthCallRepository,
  IEvmAssetsRepository,
  IIdentityRepository,
  IInflationRepository,
  IMetadataRepository,
  INftRepository,
  IPolkasafeRepository,
  ITokenApiRepository,
  ISystemRepository,
  IXcmRepository,
  IXvmRepository,
  IZkBridgeRepository,
  ISubscanRepository,
  IBalancesRepository,
} from './repositories';
import { ILzBridgeRepository } from './repositories/ILzBridgeRepository';
import { ICcipBridgeRepository } from './repositories/ICcipBridgeRepository';
import {
  AccountUnificationRepository,
  AssetsRepository,
  EthCallRepository,
  EvmAssetsRepository,
  InflationRepository,
  MetadataRepository,
  NftRepository,
  PolkasafeRepository,
  SystemRepository,
  TokenApiRepository,
  XcmRepository,
  ZkBridgeRepository,
  SubscanRepository,
  BalancesRepository,
} from './repositories/implementations';
import { IdentityRepository } from './repositories/implementations/IdentityRepository';
import { LzBridgeRepository } from './repositories/implementations/LzBridgeRepository';
import { CcipBridgeRepository } from './repositories/implementations/CcipBridgeRepository';
import {
  IAccountUnificationService,
  IAssetsService,
  IBalanceFormatterService,
  IEvmAssetsService,
  IGasPriceProvider,
  IIdentityService,
  IWalletService,
  IXcmEvmService,
  IXcmService,
  IXvmService,
  IZkBridgeService,
  ILzBridgeService,
  ICcipBridgeService,
  WalletType,
} from './services';
import {
  AccountUnificationService,
  AssetsService,
  BalanceFormatterService,
  EvmAssetsService,
  GasPriceProvider,
  IdentityService,
  MetamaskWalletService,
  PolkadotWalletService,
  XcmEvmService,
  XcmService,
  ZkBridgeService,
  LzBridgeService,
  CcipBridgeService,
} from './services/implementations';
import { Symbols } from './symbols';

let currentWalletType = WalletType.Polkadot;
let currentWalletName = '';
let isLockdropAccount = false;

export function setCurrentWallet(
  isEthWallet: boolean,
  currentWallet: string,
  isLockdrop: boolean
): void {
  if (!currentWallet) {
    return;
  }

  currentWalletType = isEthWallet ? WalletType.Metamask : WalletType.Polkadot;
  currentWalletName = currentWallet;
  isLockdropAccount = isLockdrop;

  // Memo: Trying to fix 'Invalid binding type: Symbol(CurrentWallet)' error here
  // Try to get the current wallet
  try {
    container.get<string>(Symbols.CurrentWallet);
    // If the line above did not throw an error, the binding exists, remove it.
    container.removeConstant(Symbols.CurrentWallet);
  } catch (error) {}

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

  container.addTransient<ITokenApiRepository>(TokenApiRepository, Symbols.TokenApiRepository);
  container.addTransient<IMetadataRepository>(MetadataRepository, Symbols.MetadataRepository);
  container.addTransient<ISystemRepository>(SystemRepository, Symbols.SystemRepository);
  container.addTransient<IEthCallRepository>(EthCallRepository, Symbols.EthCallRepository);
  container.addTransient<IXcmRepository>(XcmRepository, Symbols.XcmRepository);
  container.addTransient<IPolkasafeRepository>(PolkasafeRepository, Symbols.PolkasafeRepository);
  container.addTransient<IXvmRepository>(XvmRepository, Symbols.XvmRepository);
  container.addTransient<IEvmAssetsRepository>(EvmAssetsRepository, Symbols.EvmAssetsRepository);
  container.addTransient<IAssetsRepository>(AssetsRepository, Symbols.AssetsRepository);
  container.addTransient<IZkBridgeRepository>(ZkBridgeRepository, Symbols.ZkBridgeRepository);
  container.addTransient<ILzBridgeRepository>(LzBridgeRepository, Symbols.LzBridgeRepository);
  container.addTransient<ICcipBridgeRepository>(CcipBridgeRepository, Symbols.CcipBridgeRepository);
  container.addSingleton<IIdentityRepository>(IdentityRepository, Symbols.IdentityRepository);
  container.addSingleton<INftRepository>(NftRepository, Symbols.NftRepository);
  container.addSingleton<IAccountUnificationRepository>(
    AccountUnificationRepository,
    Symbols.AccountUnificationRepository
  );
  container.addSingleton<IInflationRepository>(InflationRepository, Symbols.InflationRepository);
  container.addSingleton<ISubscanRepository>(SubscanRepository, Symbols.SubscanRepository);
  container.addSingleton<IBalancesRepository>(BalancesRepository, Symbols.BalancesRepository);

  // Services
  container.addTransient<IWalletService>(PolkadotWalletService, Symbols.PolkadotWalletService);
  container.addTransient<IWalletService>(PolkadotWalletService, Symbols.PolkadotWalletService);
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
  container.addTransient<IZkBridgeService>(ZkBridgeService, Symbols.ZkBridgeService);
  container.addTransient<ILzBridgeService>(LzBridgeService, Symbols.LzBridgeService);
  container.addTransient<ICcipBridgeService>(CcipBridgeService, Symbols.CcipBridgeService);
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

  //dApp staking v3
  container.addSingleton<IDappStakingRepositoryV3>(
    DappStakingRepositoryV3,
    Symbols.DappStakingRepositoryV3
  );
  container.addSingleton<IDataProviderRepository>(
    TokenApiProviderRepository,
    Symbols.TokenApiProviderRepository
  );
  container.addSingleton<IDappStakingServiceV3>(DappStakingServiceV3, Symbols.DappStakingServiceV3);
  container.addSingleton<IDappStakingServiceV3>(
    DappStakingServiceEvmV3,
    Symbols.DappStakingServiceEvmV3
  );

  container
    .bind<interfaces.Factory<IDappStakingServiceV3>>(Symbols.DappStakingServiceFactoryV3)
    .toFactory(() => {
      return () =>
        container.get<IDappStakingServiceV3>(
          currentWalletType === WalletType.Polkadot || isLockdropAccount
            ? Symbols.DappStakingServiceV3
            : Symbols.DappStakingServiceEvmV3
        );
    });

  container.addSingleton<IDappStakingServiceV2Ledger>(
    DappStakingServiceV2Ledger,
    Symbols.DappStakingServiceV2Ledger
  );

  // Start block change subscription. Needed for remaining unlocking blocks calculation.
  container.get<ISystemRepository>(Symbols.SystemRepository).startBlockSubscription();
}
