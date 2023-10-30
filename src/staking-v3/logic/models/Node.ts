export type PeriodNumber = number;
export type EraNumber = number;
export type BlockNumber = number;

export enum PeriodType {
  Voting = 'Voting',
  BuildAndEarn = 'BuildAndEarn',
}

export interface PeriodInfo {
  number: PeriodNumber;
  type: PeriodType;
  endingEra: EraNumber;
}

// General information & state of the dApp staking protocol.
export interface ProtocolState {
  // Ongoing era number.
  era: EraNumber;
  // Block number at which the next era should start.
  nextEraStart: BlockNumber;
  // Ongoing period type and when is it expected to end.
  periodInfo: PeriodInfo;
  // `true` if pallet is in maintenance mode (disabled), `false` otherwise.
  maintenance: boolean;
}
