import 'reflect-metadata';
import { container } from 'inversify-props';
import { IApi } from './integration';
import { Api } from './integration/implementation';
import { IDappStakRepository, IPriceRepository } from './repositories';
import { CoinGeckoPriceRepository, DappStakingRepository } from './repositories/implementations';
import { IDappStakingService } from './services';
import { DappStakingService } from './services/implementations';
import { Symbols } from './symbols';

export default function buildDependencyContainer(): void {
  container.addSingleton<IApi>(Api);

  // Repositories
  container.addSingleton<IDappStakRepository>(DappStakingRepository);
  container.addSingleton<IPriceRepository>(CoinGeckoPriceRepository, Symbols.CoinGecko);

  // Services
  container.addTransient<IDappStakingService>(DappStakingService);
}
