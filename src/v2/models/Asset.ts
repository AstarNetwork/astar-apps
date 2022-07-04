import { BN } from '@polkadot/util';

export class Asset {
  public userBalance: string;
  public userBalanceUsd: string;
  public balance: BN;

  constructor(public id: string, public mappedERC20Addr: string, public metadata: AssetMetadata) {
    this.balance = new BN(0);
    this.userBalance = '0';
    this.userBalanceUsd = '0';
  }
}

export class AssetMetadata {
  constructor(
    public name: string,
    public symbol: string,
    public decimals: number,
    public isFrozen: boolean,
    public deposit: BN
  ) {}
}
