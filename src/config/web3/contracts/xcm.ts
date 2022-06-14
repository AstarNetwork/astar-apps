import { EthReceipt } from '@polkadot/types/interfaces';
import type { Contract } from 'web3-eth-contract/types';
import BN from 'bn.js';

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
    finalizedCallback: () => Promise<void>
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
        .on('transactionHash', (hash: string) => {
          resolve(hash);
        })
        .on('receipt', (receipt: EthReceipt) => {
          // console.log('receipt', receipt.transactionHash);
          finalizedCallback();
        })
        .on('error', (error: Error) => {
          reject(error.message);
        });
    });
  };
}
