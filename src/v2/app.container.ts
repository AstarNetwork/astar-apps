import 'reflect-metadata';
import { Container } from 'inversify';
import { IApi } from './integration';
import { Api } from './integration/implementation';
import { IDappStakingRepository, IMetadataRepository, IPriceRepository } from './repositories';
import { CoinGeckoPriceRepository, DappStakingRepository } from './repositories/implementations';
import { IDappStakingService } from './services';
import { DappStakingService } from './services/implementations';
import { Symbols } from './symbols';
import { MetadataRepository } from './repositories/implementations/MetadataRepository';

const container = new Container();

container.bind<IApi>(Symbols.Api).to(Api).inSingletonScope();

// Repositories
container
  .bind<IDappStakingRepository>(Symbols.DappStakingRepository)
  .to(DappStakingRepository)
  .inSingletonScope();
container
  .bind<IPriceRepository>(Symbols.PriceRepository)
  .to(CoinGeckoPriceRepository)
  .inSingletonScope();
container
  .bind<IMetadataRepository>(Symbols.MetadataRepository)
  .to(MetadataRepository)
  .inSingletonScope();

// Services
container
  .bind<IDappStakingService>(Symbols.DappStakingService)
  .to(DappStakingService)
  .inRequestScope();

export default container;
