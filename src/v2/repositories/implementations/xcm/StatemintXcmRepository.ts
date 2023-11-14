import { BN } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { XcmTokenInformation } from 'src/modules/xcm';
import { container } from 'src/v2/common';
import { ExtrinsicPayload, IApi, IApiFactory } from 'src/v2/integration';
import { Asset } from 'src/v2/models';
import { Symbols } from 'src/v2/symbols';
import { XcmRepository } from 'src/v2/repositories/implementations/XcmRepository';
import { Chain, XcmChain } from 'src/v2/models/XcmModels';
import { Struct } from '@polkadot/types';

interface Account extends Struct {
  balance: string;
}
/**
 * Used to transfer assets from Statemint/Statemine
 */
export class StatemintXcmRepository extends XcmRepository {
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

    const version = 'V3';
    const destination = {
      [version]: {
        interior: {
          X1: {
            Parachain: to.parachainId,
          },
        },
        parents: 1,
      },
    };

    const AccountId32 = {
      id: decodeAddress(recipientAddress),
    };

    const beneficiary = {
      [version]: {
        interior: {
          X1: {
            AccountId32,
          },
        },
        parents: 0,
      },
    };

    // Ref:
    // https://polkadot.network/blog/xcm-the-cross-consensus-message-format/
    // https://moonriver.polkassembly.network/referendum/85
    const instance = 50;

    const assets = {
      [version]: [
        {
          fun: {
            Fungible: new BN(amount),
          },
          id: {
            Concrete: {
              interior: {
                X2: [{ PalletInstance: instance }, { GeneralIndex: token.originAssetId }],
              },
              parents: 0,
            },
          },
        },
      ],
    };

    const feeAssetItem = 0;

    const weightLimit = {
      Unlimited: null,
    };

    return await this.buildTxCall(
      from,
      endpoint,
      'polkadotXcm',
      'limitedReserveTransferAssets',
      destination,
      beneficiary,
      assets,
      feeAssetItem,
      weightLimit
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
    // Reproduce the UI error: assets page -> transfer ASTR -> XCM -> flip the chains -> To: Statemint
    // Todo: The error is because Statemint doesn't have 'ASTR', we can refactor here later
    const statemintChains = [Chain.ASSET_HUB, Chain.ASSET_HUB_KUSAMA];
    if (!statemintChains.includes(token.originChain as Chain)) {
      return '0';
    }
    try {
      const api = await this.apiFactory.get(endpoint);
      const result = await api.query.assets.account<Account>(token.originAssetId, address);
      const data = result.toJSON();
      const balance = data ? String(data.balance) : '0';

      return balance;
    } catch (e) {
      console.error(e);
      return '0';
    }
  }
}
