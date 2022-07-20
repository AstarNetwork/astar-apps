import { Struct } from '@polkadot/types';
import { decodeAddress } from '@polkadot/util-crypto';
import BN from 'bn.js';
import { ExtrinsicPayload } from 'src/hooks/helper';
import { RelaychainApi } from '../SubstrateApi';
import { Asset } from 'src/v2/models';
interface TokensAccounts extends Struct {
  readonly free: BN;
  readonly reserved: BN;
  readonly frozen: BN;
}

export class AcalaApi extends RelaychainApi {
  private _AstarTokenId: { SDN: string; ASTR: string };
  constructor(endpoint: string) {
    super(endpoint);
    //Todo: Check the ForeignAsset ID for ASTR
    this._AstarTokenId = { SDN: '18', ASTR: '18' };
  }

  public async getTokenBalances({
    selectedToken,
    address,
    isNativeToken,
  }: {
    selectedToken: Asset;
    address: string;
    isNativeToken: boolean;
  }): Promise<string> {
    const symbol = String(selectedToken.metadata.symbol);
    const isAstarNativeToken = symbol === 'SDN' || symbol === 'ASTR';
    try {
      if (isAstarNativeToken) {
        const bal = await this.apiInst.query.tokens.accounts<TokensAccounts>(address, {
          ForeignAsset: this._AstarTokenId[symbol],
        });
        return bal.free.toString();
      }

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
    selectedToken: Asset;
  }): ExtrinsicPayload {
    let token;
    const symbol = String(selectedToken.metadata.symbol);
    const isAstarNativeToken = symbol === 'SDN' || symbol === 'ASTR';

    if (isAstarNativeToken) {
      token = {
        ForeignAsset: this._AstarTokenId[symbol],
      };
    } else {
      token = {
        Token: selectedToken.originAssetId,
      };
    }

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

    //Memo: each XCM instruction is weighted to be 1_000_000_000 units of weight and for this op to execute
    // weight value of 5 * 10^9 is generally good
    const destWeight = new BN(10).pow(new BN(9)).muln(5);
    return this.buildTxCall('xTokens', 'transfer', token, amount, dest, destWeight);
  }
}
