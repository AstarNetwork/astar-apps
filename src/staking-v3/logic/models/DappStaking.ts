import { DappInfo, ProtocolState } from './Node';

/**
 * Dapp model containing the basic information so dApps can be displayed on the homepage.
 */
export interface DappBase {
  address: string;
  name: string;
  iconUrl: string;
  mainCategory?: string;
}

/**
 * Full dApp model used to display a dApp details.
 */
export interface Dapp extends DappBase {}

/**
 * Used to notify subscribers about protocol state changes.
 */
export class ProtocolStateChangedMessage {
  constructor(public state: ProtocolState) {}
}

/**
 * Used to notify subscribers about ledger changes.
 */
export class AccountLedgerChangedMessage {
  constructor(public ledger: AccountLedger) {}
}

/**
 * Used to notify subscribers about staker info changes.
 */
export class StakerInfoChangedMessage {
  constructor(public stakerInfo: Map<string, SingularStakingInfo>) {}
}

/**
 * Combines a dApp information from different sources, on chain and storage.
 */
export interface CombinedDappInfo {
  basic: DappBase;
  extended?: Dapp;
  chain: DappInfo;
}

interface UnlockingChunk {
  readonly amount: BigInt;
  readonly unlockBlock: BigInt;
}

export interface StakeAmount {
  readonly voting: BigInt;
  readonly buildAndEarn: BigInt;
  readonly era: number;
  readonly period: number;
}

/**
 * Staker account ledger.
 */
export interface AccountLedger {
  readonly locked: BigInt;
  readonly unlocking: UnlockingChunk[];
  readonly staked: StakeAmount;
  readonly stakedFuture?: StakeAmount;
  readonly contractStakeCount: number;
}

export interface SingularStakingInfo {
  readonly staked: StakeAmount;
  readonly loyalStaker: boolean;
}
