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
    amount: BN
  ): Promise<ExtrinsicPayload> {
    if (!to.parachainId) {
      throw `Parachain id for ${to.name} is not defined`;
    }

    const recipientAccountId = getPubkeyFromSS58Addr(recipientAddress);
    const version = 'V3';
    const isWithdrawAssets = token.id !== this.astarNativeTokenId;
    const functionName = isWithdrawAssets
      ? 'limitedReserveWithdrawAssets'
      : 'limitedReserveTransferAssets';

    const destination = {
      [version]: {
        interior: {
          X1: {
            Parachain: new BN(to.parachainId),
          },
        },
        parents: new BN(1),
      },
    };

    const isAccountId20 = ethWalletChains.includes(to.name);

    const X1_V3 = isAccountId20
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

    const beneficiary = {
      [version]: {
        interior: {
          X1: X1_V3,
        },
        parents: new BN(0),
      },
    };

    const asset = isWithdrawAssets
      ? {
          Concrete: await this.fetchAssetConfig(from, token),
        }
      : {
          Concrete: {
            interior: 'Here',
            parents: new BN(0),
          },
        };

    const assets = {
      [version]: [
        {
          fun: {
            Fungible: new BN(amount),
          },
          id: asset,
        },
      ],
    };

    const weightLimit = {
      Unlimited: null,
    };

    return await this.buildTxCall(
      from,
      'polkadotXcm',
      functionName,
      destination,
      beneficiary,
      assets,
      new BN(0),
      weightLimit
    );
  }
}
