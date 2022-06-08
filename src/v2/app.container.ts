import 'reflect-metadata';
import { container } from 'inversify-props';
import { interfaces } from 'inversify';
import { IApi } from './integration';
import { Api } from './integration/implementation';
import { IDappStakingRepository, IMetadataRepository, IPriceRepository } from './repositories';
import { CoinGeckoPriceRepository, DappStakingRepository } from './repositories/implementations';
import { IDappStakingService, IWalletService, WalletType } from './services';
import { DappStakingService, PolkadotWalletService } from './services/implementations';
import { Symbols } from './symbols';
import { MetadataRepository } from './repositories/implementations/MetadataRepository';

export default function buildDependencyContainer(): void {
  container.addSingleton<IApi>(Api);

  // need to specify id because not following name convention IService -> Service
  container.addSingleton<IWalletService>(PolkadotWalletService, WalletType.Polkadot);

  // Wallet factory
  container.bind<interfaces.Factory<IWalletService>>(Symbols.WalletFactory).toFactory(() => {
    return () => {
      return container.get<IWalletService>(WalletType.Polkadot);
    };
  });

  // Repositories
  container.addSingleton<IDappStakingRepository>(DappStakingRepository);
  container.addSingleton<IPriceRepository>(CoinGeckoPriceRepository, Symbols.CoinGecko);
  container.addSingleton<IMetadataRepository>(MetadataRepository);

  // Services
  container.addTransient<IDappStakingService>(DappStakingService);
}
