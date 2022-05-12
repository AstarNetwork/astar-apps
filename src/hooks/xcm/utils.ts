import { $api } from 'boot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import BN from 'bn.js';
import { decodeAddress } from '@polkadot/util-crypto';

type ExtrinsicPayload = SubmittableExtrinsic<'promise'>;

// transfer
const buildTxCall = (extrinsic: string, method: string, ...args: any[]): ExtrinsicPayload => {
  const ext = $api?.tx[extrinsic][method](...args);
  if (ext) return ext;
  throw `Undefined extrinsic call ${extrinsic} with method ${method}`;
};

export const transferToParachain = (toPara: number, recipientAccountId: string, amount: BN) => {
  // the target parachain connected to the current relaychain
  const dest = {
    V1: {
      interior: {
        X1: {
          Parachain: new BN(toPara),
        },
      },
      parents: new BN(0),
    },
  };
  // the account ID within the destination parachain
  const beneficiary = {
    V1: {
      interior: {
        X1: {
          AccountId32: {
            network: 'Any',
            id: decodeAddress(recipientAccountId),
          },
        },
      },
      parents: new BN(0),
    },
  };
  // amount of fungible tokens to be transferred
  const assets = {
    V1: [
      {
        fun: {
          Fungible: amount,
        },
        id: {
          Concrete: {
            interior: 'Here',
            parents: new BN(0),
          },
        },
      },
    ],
  };

  return buildTxCall('xcmPallet', 'reserveTransferAssets', dest, beneficiary, assets, new BN(0));
};
