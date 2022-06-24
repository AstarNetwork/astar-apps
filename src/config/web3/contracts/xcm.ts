import BN from 'bn.js';
import { StateInterface } from 'src/store';
import { Store } from 'vuex';
import { TransactionReceipt } from 'web3-core';
import type { Contract } from 'web3-eth-contract/types';

export class XCM {
  public ci: Contract;
  public fromAddr: string;
  constructor(contractInstance: Contract, fromAddress: string) {
    this.ci = contractInstance;
    this.fromAddr = fromAddress;
  }

  /* extrinsic calls */
  callAssetsWithdraw = async (
    asset_ids: string[],
    asset_amounts: BN[],
    recipient_account_id: string,
    is_relay: boolean,
    parachain_id: number,
    fee_index: number,
    store: Store<StateInterface>
  ) => {
    return new Promise((resolve, reject) => {
      return this.ci.methods
        .assets_withdraw(
          asset_ids,
          asset_amounts,
          recipient_account_id,
          is_relay,
          parachain_id,
          fee_index
        )
        .send({ from: this.fromAddr })
        .once('transactionHash', (transactionHash: string) => {
          store.commit('general/setLoading', true);
        })
        .once('confirmation', (confNumber: number, receipt: TransactionReceipt) => {
          const msg = `Completed at transaction hash #${receipt.transactionHash}`;
          store.dispatch('general/showAlertMsg', { msg, alertType: 'success' });
          store.commit('general/setLoading', false);
          resolve(receipt.transactionHash);
        })
        .catch((error: any) => {
          console.error(error);
          store.commit('general/setLoading', false);
          store.dispatch('general/showAlertMsg', {
            msg: error.message,
            alertType: 'error',
          });
          reject(error.message);
        });
    });
  };
}
