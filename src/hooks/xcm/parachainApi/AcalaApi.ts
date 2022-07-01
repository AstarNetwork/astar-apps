import { Struct } from '@polkadot/types';
import { decodeAddress } from '@polkadot/util-crypto';
import BN from 'bn.js';
import { ethers } from 'ethers';
import { RelaychainApi } from '../SubstrateApi';

interface TokensAccounts extends Struct {
  readonly free: BN;
  readonly reserved: BN;
  readonly frozen: BN;
}

// Decimals: https://wiki.acala.network/get-started/acala-network/acala-account/acala-assets

// export class AcalaApi extends ChainApi {
export class AcalaApi extends RelaychainApi {
  private _tokens: { token: string; decimals: number }[];
  constructor(endpoint: string) {
    super(endpoint);
    this._tokens = [{ token: 'KUSD', decimals: 12 }];
  }

  public convertTokenName(token: string): string {
    const chain = this.chainProperty?.chainName;
    let t = token.toUpperCase();
    const isKaruraAusd = chain === 'Karura' && t === 'AUSD';
    if (isKaruraAusd) {
      t = 'KUSD';
    }
    return t;
  }

  public async getTokenBalances({
    token,
    address,
  }: {
    token: string;
    address: string;
  }): Promise<string> {
    try {
      const tokenName = this.convertTokenName(token);
      const bal = await this.apiInst.query.tokens.accounts<TokensAccounts>(address, {
        Token: tokenName,
      });
      const decimals = this._tokens.find((it) => it.token === tokenName)?.decimals;
      return ethers.utils.formatUnits(bal.free.toString(), decimals);
    } catch (e) {
      console.error(e);
      return '0';
    }
  }

  public transferToParachain({
    toPara,
    recipientAccountId,
    amount,
    token,
  }: {
    toPara: number;
    recipientAccountId: string;
    amount: string;
    token: string;
  }) {
    const tokenName = this.convertTokenName(token);
    const decimals = this._tokens.find((it) => it.token === tokenName)?.decimals;
    const sendAmount = ethers.utils.parseUnits(amount, decimals);

    const t = {
      Token: tokenName,
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

    // Todo: understand what this parameter stands for
    const destWeight = '5000000000';
    return this.buildTxCall('xTokens', 'transfer', t, sendAmount, dest, destWeight);
  }
}
