import { BN } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { XcmTokenInformation } from 'src/modules/xcm';
import { container } from 'src/v2/common';
import { ExtrinsicPayload, IApi, IApiFactory } from 'src/v2/integration';
import { Asset } from 'src/v2/models';
import { Chain, XcmChain } from 'src/v2/models/XcmModels';
import { TokensAccounts } from 'src/v2/repositories/implementations/xcm/AcalaXcmRepository';
import { Symbols } from 'src/v2/symbols';
import { XcmRepository } from '../XcmRepository';

/**
 * Used to transfer assets from Interlay/Kintsugi
 */
export class InterlayXcmRepository extends XcmRepository {
  constructor() {
    const defaultApi = container.get<IApi>(Symbols.DefaultApi);
    const apiFactory = container.get<IApiFactory>(Symbols.ApiFactory);
    const registeredTokens = container.get<XcmTokenInformation[]>(Symbols.RegisteredTokens);
    super(defaultApi, apiFactory, registeredTokens);
  }

  public async getTransferCall(
    from: XcmChain,
    to: XcmChain,
    recipientAddress: string,
    token: Asset,
    amount: BN,
    endpoint: string
  ): Promise<ExtrinsicPayload> {
    if (!to.parachainId) {
      throw `Parachain id for ${to.name} is not defined`;
    }

    const tokenData = { Token: token.originAssetId };

    const destination = {
      V3: {
        parents: '1',
        interior: {
          X2: [
            {
              Parachain: to.parachainId,
            },
            {
              AccountId32: {
                id: decodeAddress(recipientAddress),
              },
            },
          ],
        },
      },
    };

    const destWeight = {
      Unlimited: null,
    };
    return await this.buildTxCall(
      from,
      endpoint,
      'xTokens',
      'transfer',
      tokenData,
      amount,
      destination,
      destWeight
    );
  }

  public async getTokenBalance(
    address: string,
    chain: XcmChain,
    token: Asset,
    isNativeToken: boolean,
    endpoint: string
  ): Promise<string> {
    // Memo: avoid getting a UI error when the `token` is `ASTR` while the `monitorDestChainBalance` function(watch) in useXcmBridge.ts
    // Reproduce the UI error: assets page -> transfer ASTR -> XCM -> flip the chains -> To: Interlay
    const interlayChains = [Chain.INTERLAY, Chain.KINTSUGI];
    if (!interlayChains.includes(token.originChain as Chain)) {
      return '0';
    }
    const api = await this.apiFactory.get(endpoint);

    try {
      const bal = await api.query.tokens.accounts<TokensAccounts>(address, {
        Token: token.originAssetId,
      });
      return bal.free.toString();
    } catch (e) {
      console.error(e);
      return '0';
    }
  }

  public async getNativeBalance(address: string, chain: XcmChain, endpoint: string): Promise<BN> {
    try {
      const api = await this.apiFactory.get(endpoint);
      const { token } = api.consts.currency.getNativeCurrencyId.toJSON() as any;
      const originChainNativeBal = await api.query.tokens.accounts<TokensAccounts>(address, {
        Token: token,
      });
      return originChainNativeBal.free;
    } catch (e) {
      console.error(e);
      return new BN(0);
    }
  }
}
