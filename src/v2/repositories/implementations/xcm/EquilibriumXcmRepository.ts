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

const EQUILIBRIUM_DECIMALS = 9;

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

  private signedBalanceStringify(
    b?: EqPrimitivesSignedBalance,
    decimals: number = EQUILIBRIUM_DECIMALS
  ): string {
    if (!b) {
      return '0';
    }

    const decimalsMul =
      decimals > EQUILIBRIUM_DECIMALS
        ? new BN(10).pow(new BN(decimals - EQUILIBRIUM_DECIMALS))
        : new BN(1);

    const sign = b.isNegative ? '-' : '';
    const val = sign ? b.asNegative : b.asPositive;

    return `${sign}${val.mul(decimalsMul).toString(10)}`;
  }

  public async getTransferCall(
    from: XcmChain,
    to: XcmChain,
    recipientAddress: string,
    token: Asset,
    amount: BN,
    endpoint: string
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
    const decimalsMul =
      token.metadata.decimals > EQUILIBRIUM_DECIMALS
        ? new BN(10).pow(new BN(token.metadata.decimals - EQUILIBRIUM_DECIMALS))
        : new BN(1);

    return await this.buildTxCall(
      from,
      endpoint,
      'eqBalances',
      isTransferNative ? 'xcmTransferNative' : 'xcmTransfer',
      assetId,
      amount.div(decimalsMul),
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
                    id: pub,
                  },
                },
              ],
            },
          },
      'SovereignAccWillPay'
    );
  }

  public async getNativeBalance(address: string, chain: XcmChain, endpoint: string): Promise<BN> {
    const api = await this.apiFactory.get(endpoint);

    const accountInfo = (await api.query.system.account(
      address
    )) as unknown as FrameSystemAccountInfo;

    if (!accountInfo.data.isV0) return new BN(0);

    const total = this.signedBalanceStringify(
      accountInfo.data.asV0.balance.find(
        ([assetId]) => assetId.toNumber() === this.assetToId('eq')
      )?.[1]
    );

    const locked = accountInfo.data.asV0.lock.toString(10);

    const balance = new BN(total).sub(new BN(locked));

    return balance;
  }

  public async getTokenBalance(
    address: string,
    chain: XcmChain,
    token: Asset,
    isNativeToken: boolean,
    endpoint: string
  ): Promise<string> {
    const symbol = token.metadata.symbol;

    if (symbol.toLowerCase() === 'eq' && chain.parachainId === parachainIds.EQUILIBRIUM) {
      return (await this.getNativeBalance(address, chain, endpoint)).toString(10);
    }

    const api = await this.apiFactory.get(endpoint);

    const accountInfo = (await api.query.system.account(
      address
    )) as unknown as FrameSystemAccountInfo;

    const id = this.assetToId(symbol);

    return accountInfo.data.isV0
      ? this.signedBalanceStringify(
          accountInfo.data.asV0.balance.find(([assetId]) => assetId.toNumber() === id)?.[1],
          token.metadata.decimals
        )
      : '0';
  }
}
