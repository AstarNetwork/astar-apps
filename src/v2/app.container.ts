import 'reflect-metadata';
import { container } from 'inversify-props';
import { interfaces } from 'inversify';
import { IApi } from './integration';
import { Api } from './integration/implementation';
import {
  IDappStakingRepository,
  IEthCallRepository,
  IMetadataRepository,
  IPriceRepository,
  ISystemRepository,
} from './repositories';
import {
  CoinGeckoPriceRepository,
  DappStakingRepository,
  MetadataRepository,
  SystemRepository,
} from './repositories/implementations';
import { IDappStakingService, IWalletService, WalletType } from './services';
import {
  DappStakingService,
  PolkadotWalletService,
  MetamaskWalletService,
} from './services/implementations';
import { Symbols } from './symbols';
import { IEventAggregator, EventAggregator } from './messaging';
import { EthCallRepository } from './repositories/implementations/EthCallRepository';

let currentWallet = WalletType.Polkadot;

export function setCurrentWallet(isEthWallet: boolean): void {
  currentWallet = isEthWallet ? WalletType.Metamask : WalletType.Polkadot;
}

export default function buildDependencyContainer(): void {
  container.addSingleton<IEventAggregator>(EventAggregator);
  container.addSingleton<IApi>(Api);

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
  container.addSingleton<IDappStakingRepository>(DappStakingRepository);
  container.addSingleton<IPriceRepository>(CoinGeckoPriceRepository, Symbols.CoinGecko);
  container.addSingleton<IMetadataRepository>(MetadataRepository);
  container.addSingleton<ISystemRepository>(SystemRepository);
  container.addSingleton<IEthCallRepository>(EthCallRepository);

  // Services
  container.addTransient<IDappStakingService>(DappStakingService);
}
