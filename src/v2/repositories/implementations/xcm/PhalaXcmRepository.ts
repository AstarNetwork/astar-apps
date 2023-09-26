import { BN } from '@polkadot/util';
import { Option } from '@polkadot/types-codec';
import { XcmTokenInformation } from 'src/modules/xcm';
import { container } from 'src/v2/common';
import { ExtrinsicPayload, IApi, IApiFactory } from 'src/v2/integration';
import { Asset } from 'src/v2/models';
import { Symbols } from 'src/v2/symbols';
import { XcmRepository } from '../XcmRepository';
import { Chain, ethWalletChains, parachainIds, XcmChain } from 'src/v2/models/XcmModels';
import { Struct } from '@polkadot/types';
import { getPubkeyFromSS58Addr } from '@astar-network/astar-sdk-core';

export interface AssetsAccount extends Struct {
  readonly balance: BN;
}

/**
 * Used to transfer assets from Phala/Khala
 */
export class PhalaXcmRepository extends XcmRepository {
  constructor() {
    const defaultApi = container.get<IApi>(Symbols.DefaultApi);
    const apiFactory = container.get<IApiFactory>(Symbols.ApiFactory);
    const registeredTokens = container.get<XcmTokenInformation[]>(Symbols.RegisteredTokens);

    super(defaultApi, apiFactory, registeredTokens);

    this.astarTokens = {
      ASTR: 6,
      SDN: 12,
    };
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

    const tokenData = this.getConcreteId(from, token);
    const isAccountId20 = ethWalletChains.includes(to.name);
    const recipientAccountId = getPubkeyFromSS58Addr(recipientAddress);

    const asset = {
      id: { Concrete: tokenData },
      fun: { Fungible: amount },
    };
    const destination = {
      parents: 1,
      interior: {
        X2: [
          { Parachain: to.parachainId },
          isAccountId20
            ? { AccountKey20: { key: recipientAccountId } }
            : { AccountId32: { id: recipientAccountId } },
        ],
      },
    };

    const destWeight = { refTime: '6000000000', proofSize: '1000000' };
    return await this.buildTxCall(
      from,
      endpoint,
      'xTransfer',
      'transfer',
      asset,
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
    const symbol = token.metadata.symbol;
    const api = await this.apiFactory.get(endpoint);

    try {
      if (this.isAstarNativeToken(token)) {
        const bal = await api.query.assets.account<Option<AssetsAccount>>(
          this.astarTokens[symbol],
          address
        );
        return bal.unwrap().balance.toString();
      }

      if (isNativeToken) {
        return (await this.getNativeBalance(address, chain, endpoint)).toString();
      }

      throw `Token ${symbol} is not defined`;
    } catch (e) {
      console.error(e);
      return '0';
    }
  }

  private getConcreteId(from: XcmChain, token: Asset) {
    const symbol = token.metadata.symbol;
    const assetConcreteId: { [chain in Chain]?: { [asset in string]: unknown } } = {
      [Chain.KHALA]: {
        PHA: { parents: 0, interior: 'Here' },
        SDN: { parents: 1, interior: { X1: { Parachain: parachainIds.SHIDEN } } },
      },
      [Chain.PHALA]: {
        PHA: { parents: 0, interior: 'Here' },
        ASTR: { parents: 1, interior: { X1: { Parachain: parachainIds.ASTAR } } },
      },
    };
    const concreteId = assetConcreteId[from.name]?.[symbol];

    if (concreteId) {
      return concreteId;
    }

    throw `Token ${symbol} is not defined`;
  }
}
