import { ChainApi } from 'src/hooks/xcm/SubstrateApi';
import { decodeAddress } from '@polkadot/util-crypto';
import { Struct } from '@polkadot/types';
import BN from 'bn.js';
import { ExtrinsicPayload } from 'src/hooks/helper';
import { Asset } from 'src/v2/models';

interface Account extends Struct {
  balance: string;
}

export class StatemintApi extends ChainApi {
  constructor(endpoint: string) {
    super(endpoint);
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
    try {
      await this.apiInst.isReady;
      const result = await this.apiInst.query.assets.account<Account>(
        selectedToken.originAssetId,
        address
      );
      const data = result.toJSON();
      const balance = data ? String(data.balance) : '0';

      return balance;
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
    const dest = {
      V0: {
        X2: [{ Parent: null }, { Parachain: toPara }],
      },
    };

    const beneficiary = {
      V0: {
        X1: {
          AccountId32: {
            id: decodeAddress(recipientAccountId),
            network: {
              Any: null,
            },
          },
        },
      },
    };

    // Ref:
    // https://polkadot.network/blog/xcm-the-cross-consensus-message-format/
    // https://moonriver.polkassembly.network/referendum/85
    const instance = 50;

    const assets = {
      V0: [
        {
          ConcreteFungible: {
            amount: new BN(amount),
            id: {
              X2: [{ PalletInstance: instance }, { GeneralIndex: selectedToken.originAssetId }],
            },
          },
        },
      ],
    };

    const feeAssetItem = 0;

    const weightLimit = {
      Unlimited: null,
    };

    return this.buildTxCall(
      'polkadotXcm',
      'limitedReserveTransferAssets',
      dest,
      beneficiary,
      assets,
      feeAssetItem,
      weightLimit
    );
  }
}
