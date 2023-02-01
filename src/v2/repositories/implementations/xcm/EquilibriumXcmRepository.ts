import type { Enum, Struct, u32, u64, u128, Vec } from '@polkadot/types';
import type { ITuple } from '@polkadot/types-codec/types';
import { BN } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { XcmTokenInformation } from 'src/modules/xcm';
import { container } from 'src/v2/common';
import { ExtrinsicPayload, IApi, IApiFactory } from 'src/v2/integration';
import { Asset, parachainIds, XcmChain } from 'src/v2/models';
import { Symbols } from 'src/v2/symbols';
import { XcmRepository } from '../XcmRepository';

interface FrameSystemAccountInfo extends Struct {
  readonly nonce: u32;
  readonly consumers: u32;
  readonly providers: u32;
  readonly sufficients: u32;
  readonly data: EqPrimitivesBalanceAccountData;
}

interface EqPrimitivesBalanceAccountData extends Enum {
  readonly isV0: boolean;
  readonly asV0: {
    readonly lock: u128;
    readonly balance: EqUtilsVecMapSignedBalance;
  } & Struct;
  readonly type: 'V0';
}

interface EqUtilsVecMapSignedBalance extends Vec<ITuple<[u64, EqPrimitivesSignedBalance]>> {}

interface EqPrimitivesSignedBalance extends Enum {
  readonly isPositive: boolean;
  readonly asPositive: u128;
  readonly isNegative: boolean;
  readonly asNegative: u128;
  readonly type: 'Positive' | 'Negative';
}

export class EquilibriumXcmRepository extends XcmRepository {
  constructor() {
    const defaultApi = container.get<IApi>(Symbols.DefaultApi);
    const apiFactory = container.get<IApiFactory>(Symbols.ApiFactory);
    const registeredTokens = container.get<XcmTokenInformation[]>(Symbols.RegisteredTokens);

    super(defaultApi, apiFactory, registeredTokens);
  }

  private assetToId(token: string) {
    return parseInt(Buffer.from(token.toLowerCase(), 'utf8').toString('hex'), 16);
  }

  private idToAsset(id: number) {
    return Buffer.from(id.toString(16), 'hex').toString('utf8');
  }

  private signedBalanceStringify(b?: EqPrimitivesSignedBalance): string {
    if (!b) {
      return '0';
    }

    const sign = b.isNegative ? '-' : '';
    const val = sign ? b.asNegative.toString(10) : b.asPositive.toString(10);
    return `${sign}${val}`;
  }

  public async getTransferCall(
    from: XcmChain,
    to: XcmChain,
    recipientAddress: string,
    token: Asset,
    amount: BN
  ): Promise<ExtrinsicPayload> {
    if (from.parachainId !== parachainIds.EQUILIBRIUM) {
      throw new Error('not implemented');
    }

    if (!to.parachainId) {
      throw `Parachain id for ${to.name} is not defined`;
    }

    const symbol = token.metadata.symbol;
    const isTransferNative = symbol.toLowerCase() === 'astr';
    const assetId = this.assetToId(symbol);
    const pub = decodeAddress(recipientAddress);

    return await this.buildTxCall(
      from,
      'eqBalances',
      isTransferNative ? 'xcmTransferNative' : 'xcmTransfer',
      assetId,
      amount,
      isTransferNative
        ? { Id32: pub }
        : {
            parents: 1,
            interior: {
              X2: [
                {
                  Parachain: to.parachainId,
                },
                {
                  AccountId32: {
                    Network: 'Any',
                    id: pub,
                  },
                },
              ],
            },
          },
      'SovereignAccWillPay'
    );
  }

  public async getTokenBalance(
    address: string,
    chain: XcmChain,
    token: Asset,
    isNativeToken: boolean
  ): Promise<string> {
    const symbol = token.metadata.symbol;
    const api = await this.apiFactory.get(chain.endpoint);

    if (isNativeToken && chain.parachainId !== parachainIds.EQUILIBRIUM) {
      return this.getNativeBalance(address, chain).then((v) => v.toString(10));
    }

    const accountInfo = (await api.query.system.account(
      address
    )) as unknown as FrameSystemAccountInfo;

    const id = this.assetToId(symbol);

    return accountInfo.data.isV0
      ? this.signedBalanceStringify(
          accountInfo.data.asV0.balance.find(([assetId]) => assetId.toNumber() === id)?.[1]
        )
      : '0';
  }
}
