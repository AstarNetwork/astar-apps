import { MutationTree } from 'vuex';
import { DappStakingState } from './state';
import {
  AccountLedger,
  CombinedDappInfo,
  Dapp,
  ProtocolState,
  SingularStakingInfo,
  NumberOfStakersAndLockers,
  Rewards,
  Constants,
  EraInfo,
  DAppTierRewards,
  DappInfo,
  TiersConfiguration,
  EraLengths,
  ProviderDappData,
} from '../logic';

export interface DappStakingMutations<S = DappStakingState> {
  addDapps(state: DappStakingState, dapps: CombinedDappInfo[]): void;
  addNewDapps(state: DappStakingState, dapps: DappInfo[]): void;
  addDapp(state: DappStakingState, dapp: CombinedDappInfo): void;
  updateDappExtended(state: DappStakingState, dapp: Dapp): void;
  updateDappChain(state: DappStakingState, dapp: DappInfo): void;
  updateDappDetails(state: DappStakingState, dapp: ProviderDappData): void;
  setNumberOfStakersAndLockers(
    state: DappStakingState,
    numberOfStakersAndLockers: NumberOfStakersAndLockers
  ): void;
  setProtocolState(state: DappStakingState, protocolState: ProtocolState): void;
  setLedger(state: DappStakingState, ledger: AccountLedger): void;
  setStakerInfo(state: DappStakingState, stakerInfo: Map<string, SingularStakingInfo>): void;
  setRewards(state: DappStakingState, rewards: Rewards): void;
  setConstants(state: DappStakingState, constants: Constants): void;
  setCurrentEraInfo(state: DappStakingState, currentEra: EraInfo): void;
  setDappTiers(state: DappStakingState, dAppTiers: DAppTierRewards): void;
  setTiersConfiguration(state: DappStakingState, tiersConfiguration: TiersConfiguration): void;
  setEraLengths(state: DappStakingState, eraLengths: EraLengths): void;
  setLeaderboard(state: DappStakingState, leaderboard: Map<number, number>): void;
}

const updateDapp = <T>(
  state: DappStakingState,
  dappAddress: string,
  data: T,
  propertyToUpdate: 'basic' | 'extended' | 'chain' | 'dappDetails'
): void => {
  // TODO see how to figure out type of T, so we can remove propertyToUpdate parameter.
  const dappToUpdate = state.dapps.find(
    (x) => x.basic.address.toLowerCase() === dappAddress.toLowerCase()
  );

  if (dappToUpdate) {
    const index = state.dapps.indexOf(dappToUpdate);
    state.dapps.splice(index, 1, { ...dappToUpdate, [propertyToUpdate]: data });
  } else {
    console.warn(`Dapp with address ${dappAddress} not found in the store.`);
  }
};

const mutations: MutationTree<DappStakingState> & DappStakingMutations = {
  addDapps(state, dapps) {
    state.dapps = dapps;
  },
  addNewDapps(state, dapps) {
    state.newDapps = dapps;
  },
  addDapp(state, dapp) {
    state.dapps.push(dapp);
  },
  updateDappExtended(state, dapp) {
    updateDapp(state, dapp.address, dapp, 'extended');
  },
  updateDappChain(state: DappStakingState, dapp: DappInfo): void {
    updateDapp(state, dapp.address, dapp, 'chain');
  },
  updateDappDetails(state: DappStakingState, dapp: ProviderDappData): void {
    updateDapp(state, dapp.contractAddress, dapp, 'dappDetails');
  },
  setNumberOfStakersAndLockers(state, numberOfStakersAndLockers) {
    state.numberOfStakersAndLockers = numberOfStakersAndLockers;
  },
  setProtocolState(state, protocolState) {
    state.protocolState = protocolState;
  },
  setLedger(state, ledger) {
    state.ledger = ledger;
  },
  setStakerInfo(state, stakerInfo) {
    state.stakerInfo = stakerInfo;
  },
  setRewards(state, rewards) {
    state.rewards = rewards;
  },
  setConstants(state, constants) {
    state.constants = constants;
  },
  setCurrentEraInfo(state, currentEra) {
    state.currentEra = currentEra;
  },
  setDappTiers(state, dAppTiers) {
    state.dAppTiers = dAppTiers;
  },
  setTiersConfiguration(state, tiersConfiguration) {
    state.tiersConfiguration = tiersConfiguration;
  },
  setEraLengths(state, eraLengths) {
    state.eraLengths = eraLengths;
  },
  setLeaderboard(state, leaderboard) {
    state.leaderboard = leaderboard;
  },
};

export default mutations;
