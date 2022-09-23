import { BN } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { getPubkeyFromSS58Addr } from 'src/hooks/helper/addressUtils';
import { ethWalletChains, XcmTokenInformation } from 'src/modules/xcm';
import { container } from 'src/v2/common';
import { ExtrinsicPayload, IApi, IApiFactory } from 'src/v2/integration';
import { Asset } from 'src/v2/models';
import { Symbols } from 'src/v2/symbols';
import { XcmRepository } from '../XcmRepository';
import { XcmChain } from 'src/modules/xcm';

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

    const isWithdrawAssets = token.id !== this.astarNativeTokenId;
    const functionName = isWithdrawAssets ? 'reserveWithdrawAssets' : 'reserveTransferAssets';
    const isSendToParachain = to.parachainId > 0;
    const destination = isSendToParachain
      ? {
          V1: {
            interior: {
              X1: {
                Parachain: new BN(to.parachainId),
              },
            },
            parents: new BN(1),
          },
        }
      : {
          V1: {
            interior: 'Here',
            parents: new BN(1),
          },
        };

    const isAccountId20 = ethWalletChains.includes(to.name);
    const X1 = isAccountId20
      ? {
          AccountKey20: {
            network: 'Any',
            key: recipientAccountId,
          },
        }
      : {
          AccountId32: {
            network: 'Any',
            id: decodeAddress(recipientAccountId),
          },
        };

    const beneficiary = {
      V1: {
        interior: {
          X1,
        },
        parents: new BN(0),
      },
    };

    const isRegisteredAsset = isSendToParachain && isWithdrawAssets;

    const asset = isRegisteredAsset
      ? {
          Concrete: await this.fetchAssetConfig(from, token),
        }
      : {
          Concrete: {
            interior: 'Here',
            parents: new BN(isSendToParachain ? 0 : 1),
          },
        };

    const assets = {
      V1: [
        {
          fun: {
            Fungible: new BN(amount),
          },
          id: asset,
        },
      ],
    };

    return await this.buildTxCall(
      from,
      'polkadotXcm',
      functionName,
      destination,
      beneficiary,
      assets,
      new BN(0)
    );
  }
}
