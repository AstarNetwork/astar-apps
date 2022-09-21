import { BN } from '@polkadot/util';

export class Asset {
  public userBalanceUsd: number;
  public balance: BN;

  constructor(
    public id: string,
    public mappedERC20Addr: string,
    public metadata: AssetMetadata,
    public minBridgeAmount: string,
    public originChain: string,
    public originAssetId: string,
    public tokenImage: string,
    public isNativeToken: boolean,
    public isXcmCompatible: boolean,
    public userBalance: number
  ) {
    this.balance = new BN(0);
    this.userBalanceUsd = 0;
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
