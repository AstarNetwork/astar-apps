import { BN } from '@polkadot/util';
import { XcmTokenInformation } from 'src/modules/xcm';
import { container } from 'src/v2/common';
import { IApi, IApiFactory } from 'src/v2/integration';
import { Symbols } from 'src/v2/symbols';
import { XcmRepository } from '../XcmRepository';
import { Struct } from '@polkadot/types';

/**
 * Used to transfer assets from Polkadot/Kusama
 */
export class PolkadotXcmRepository extends XcmRepository {
  constructor() {
    const defaultApi = container.get<IApi>(Symbols.DefaultApi);
    const apiFactory = container.get<IApiFactory>(Symbols.ApiFactory);
    const registeredTokens = container.get<XcmTokenInformation[]>(Symbols.RegisteredTokens);

    super(defaultApi, apiFactory, registeredTokens);
  }
}
