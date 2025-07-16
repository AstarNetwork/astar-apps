import { BN } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { getPubkeyFromSS58Addr } from '@astar-network/astar-sdk-core';
import { XcmTokenInformation } from 'src/modules/xcm';
import { container } from 'src/v2/common';
import { ExtrinsicPayload, IApi, IApiFactory } from 'src/v2/integration';
import { Asset, ethWalletChains, XcmChain } from 'src/v2/models';
import { Symbols } from 'src/v2/symbols';
import { XcmRepository } from '../XcmRepository';

/**
 * Used to transfer assets from Astar/Shiden.
 */
export class AstarXcmRepository extends XcmRepository {
  private astarNativeTokenId;
  protected readonly xcmVersion = 'V5';

  constructor() {
    const defaultApi = container.get<IApi>(Symbols.DefaultApi);
    const apiFactory = container.get<IApiFactory>(Symbols.ApiFactory);
    const registeredTokens = container.get<XcmTokenInformation[]>(Symbols.RegisteredTokens);

    super(defaultApi, apiFactory, registeredTokens);
    this.astarNativeTokenId = '0000000000000000000';
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

    const recipientAccountId = getPubkeyFromSS58Addr(recipientAddress);
    const isWithdrawAssets = token.id !== this.astarNativeTokenId;

    const asset = isWithdrawAssets
      ? await this.fetchAssetConfig(from, token, endpoint)
      : {
          interior: 'Here',
          parents: new BN(0),
        };

    const assets = {
      [this.xcmVersion]: {
        fun: {
          Fungible: new BN(amount),
        },
        id: asset,
      },
    };

    const isAccountId20 = ethWalletChains.includes(to.name);

    const accountId = isAccountId20
      ? {
          AccountKey20: {
            key: recipientAccountId,
          },
        }
      : {
          AccountId32: {
            id: decodeAddress(recipientAccountId),
          },
        };

    const destination = {
      [this.xcmVersion]: {
        interior: {
          X2: [
            {
              Parachain: new BN(to.parachainId),
            },
            {
              ...accountId,
            },
          ],
        },
        parents: new BN(1),
      },
    };

    const weightLimit = {
      Unlimited: null,
    };

    const feeAssetInformation = this.getFeeInformation(token, from, to);

    if (feeAssetInformation.feeAssetIsRequired) {
      // we need to use another token for the fee
      const fee = {
        [this.xcmVersion]: {
          fun: {
            Fungible: new BN(feeAssetInformation.feeAmount),
          },
          id: {
            Concrete: await this.fetchAssetConfigById(
              from,
              feeAssetInformation.feeAssetId,
              endpoint
            ),
          },
        },
      };

      return await this.buildTxCall(
        from,
        endpoint,
        'xTokens',
        'transferMultiassetWithFee',
        assets,
        fee,
        destination,
        weightLimit
      );
    }

    return await this.buildTxCall(
      from,
      endpoint,
      'xTokens',
      'transferMultiasset',
      assets,
      destination,
      weightLimit
    );
  }
}
