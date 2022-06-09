import { $web3 } from 'boot/api';
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
    fee_index: number
  ) => {
    const recipientAccountId = $web3.value?.utils.asciiToHex(recipient_account_id);
    return await this.ci.methods
      .assets_withdraw(
        asset_ids,
        asset_amounts,
        recipientAccountId,
        is_relay,
        parachain_id,
        fee_index
      )
      .send({ from: this.fromAddr });
  };
}
