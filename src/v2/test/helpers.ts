import 'reflect-metadata';
import { interfaces } from 'inversify';
import {
  IDappStakingRepository,
  IMetadataRepository,
  IPriceRepository,
  ISystemRepository,
  IXcmRepository,
  IXvmRepository,
} from 'src/v2/repositories';
import { DappStakingRepositoryMock } from 'src/v2/test/mocks/repositories/DappStakingRepositoryMock';
import { PriceRepositoryMock } from './mocks/repositories/PriceRepositoryMock';
import { MetadataRepositoryMock } from './mocks/repositories/MetadataRepositoryMock';
import { WalletServiceMock } from './mocks/services/WalletServiceMock';
import { XcmRepositoryMock } from './mocks/repositories/XcmRepositoryMock';
import { XvmRepositoryMock } from './mocks/repositories/XvmRepositoryMock';
import {
  IBalanceFormatterService,
  IDappStakingService,
  IGasPriceProvider,
  IWalletService,
  IXcmService,
  IXvmService,
} from 'src/v2/services';
import { DappStakingService } from 'src/v2/services/implementations/DappStakingService';
import { GasPriceProvider } from 'src/v2/services/implementations/GasPriceProvider';
import { Symbols } from 'src/v2/symbols';
import { EventAggregator, IEventAggregator } from 'src/v2/messaging';
import { container } from '../common';

import { XcmService } from 'src/v2/services/implementations/XcmService';
import { XvmService } from 'src/v2/services/implementations/XvmService';
import { BalanceFormatterService } from 'src/v2/services/implementations/BalanceFormatterService';
import { SystemRepositoryMock } from './mocks/repositories/SystemRepositoryMock';
import { ITypeFactory, TypeFactory, TypeMapping } from '../config/types';

const TestSymbols = {
  WalletServiceMock: Symbol.for('WalletServiceMock'),
};

const initTestContainer = () => {
  container.addSingleton<IEventAggregator>(EventAggregator);
  container.addConstant<TypeMapping>(Symbols.TypeMappings, {});
  container.addSingleton<ITypeFactory>(TypeFactory, Symbols.TypeFactory);

  container.addSingleton<IGasPriceProvider>(GasPriceProvider);
  container.addSingleton<IDappStakingRepository>(
    DappStakingRepositoryMock,
    Symbols.DappStakingRepository
  );
  container.addSingleton<IPriceRepository>(PriceRepositoryMock, Symbols.PriceRepository);
  container.addSingleton<IMetadataRepository>(MetadataRepositoryMock, Symbols.MetadataRepository);
  container.addSingleton<IXcmRepository>(XcmRepositoryMock, Symbols.XcmRepository);
  container.addSingleton<IXvmRepository>(XvmRepositoryMock, Symbols.XvmRepository);
  container.addSingleton<ISystemRepository>(SystemRepositoryMock, Symbols.SystemRepository);

  container.addSingleton<IBalanceFormatterService>(BalanceFormatterService);
  container.addSingleton<IDappStakingService>(DappStakingService);
  container.addSingleton<IWalletService>(WalletServiceMock);
  container.addSingleton<IXcmService>(XcmService);
  container.addSingleton<IXvmService>(XvmService);

  // Wallet factory
  container.bind<interfaces.Factory<IWalletService>>(Symbols.WalletFactory).toFactory(() => {
    return () => {
      return container.get<IWalletService>(TestSymbols.WalletServiceMock);
    };
  });
};

export { initTestContainer, TestSymbols };
