import 'reflect-metadata';
import { container } from 'inversify-props';
import { IApi } from './integration';
import { Api } from './integration/implementation';
import { IDappStakingRepository, IMetadataRepository, IPriceRepository } from './repositories';
import { CoinGeckoPriceRepository, DappStakingRepository } from './repositories/implementations';
import { IDappStakingService } from './services';
import { DappStakingService } from './services/implementations';
import { Symbols } from './symbols';
import { MetadataRepository } from './repositories/implementations/MetadataRepository';

export default function buildDependencyContainer(): void {
  container.addSingleton<IApi>(Api);

  // Repositories
  container.addSingleton<IDappStakingRepository>(DappStakingRepository);
  container.addSingleton<IPriceRepository>(CoinGeckoPriceRepository, Symbols.CoinGecko);
  container.addSingleton<IMetadataRepository>(MetadataRepository);

  // Services
  container.addTransient<IDappStakingService>(DappStakingService);
}
