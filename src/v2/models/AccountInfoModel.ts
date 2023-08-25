import { BN } from '@polkadot/util';
import { Guard } from 'src/v2/common';

export class AccountInfoModel {
  constructor(public nonce: BN, public data: AccountDataModel) {
    Guard.ThrowIfNegative('nonce', nonce);
    Guard.ThrowIfUndefined('data', data);
  }
}

export class AccountDataModel {
  constructor(public free: BN, public reserved: BN, public frozen: BN, public flags: BN) {}
}
