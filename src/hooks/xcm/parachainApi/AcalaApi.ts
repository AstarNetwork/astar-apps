import { Struct } from '@polkadot/types';
import { decodeAddress } from '@polkadot/util-crypto';
import BN from 'bn.js';
import { ExtrinsicPayload } from 'src/hooks/helper';
import { RelaychainApi } from '../SubstrateApi';
import { ChainAsset } from '../useXcmAssets';

interface TokensAccounts extends Struct {
  readonly free: BN;
  readonly reserved: BN;
  readonly frozen: BN;
}

export class AcalaApi extends RelaychainApi {
  constructor(endpoint: string) {
    super(endpoint);
  }

  public async getTokenBalances({
    selectedToken,
    address,
    isNativeToken,
  }: {
    selectedToken: ChainAsset;
    address: string;
    isNativeToken: boolean;
  }): Promise<string> {
    try {
      if (isNativeToken) {
        return (await this.getNativeBalance(address)).toString();
      } else {
        const bal = await this.apiInst.query.tokens.accounts<TokensAccounts>(address, {
          Token: selectedToken.originAssetId,
        });
        return bal.free.toString();
      }
    } catch (e) {
      console.error(e);
      return '0';
    }
  }

  public transferToParachain({
    toPara,
    recipientAccountId,
    amount,
    selectedToken,
  }: {
    toPara: number;
    recipientAccountId: string;
    amount: string;
    selectedToken: ChainAsset;
  }): ExtrinsicPayload {
    const t = {
      Token: selectedToken.originAssetId,
    };

    const dest = {
      V1: {
        parents: '1',
        interior: {
          X2: [
            {
              Parachain: toPara,
            },
            {
              AccountId32: {
                network: {
                  Any: null,
                },
                id: decodeAddress(recipientAccountId),
              },
            },
          ],
        },
      },
    };

    // Ref: https://stakesg.slack.com/archives/C03BN19LBQ8/p1656916640753869?thread_ts=1656877596.595339&cid=C03BN19LBQ8
    const destWeight = '5000000000';
    return this.buildTxCall('xTokens', 'transfer', t, amount, dest, destWeight);
  }
}
