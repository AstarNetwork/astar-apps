import { MutationTree } from 'vuex';
import { DappStakingState } from './state';
import {
  AccountLedger,
  CombinedDappInfo,
  Dapp,
  ProtocolState,
  SingularStakingInfo,
  Rewards,
  Constants,
  EraInfo,
  DAppTierRewards,
  DappInfo,
} from '../logic';

export interface DappStakingMutations<S = DappStakingState> {
  addDapps(state: DappStakingState, dapps: CombinedDappInfo[]): void;
  addDapp(state: DappStakingState, dapp: CombinedDappInfo): void;
  updateDappExtended(state: DappStakingState, dapp: Dapp): void;
  updateDappChain(state: DappStakingState, dapp: DappInfo): void;
  setProtocolState(state: DappStakingState, protocolState: ProtocolState): void;
  setLedger(state: DappStakingState, ledger: AccountLedger): void;
  setStakerInfo(state: DappStakingState, stakerInfo: Map<string, SingularStakingInfo>): void;
  setRewards(state: DappStakingState, rewards: Rewards): void;
  setConstants(state: DappStakingState, constants: Constants): void;
  setCurrentEraInfo(state: DappStakingState, currentEra: EraInfo): void;
  setDappTiers(state: DappStakingState, dAppTiers: DAppTierRewards): void;
}

const updateDapp = (
  state: DappStakingState,
  dapp: CombinedDappInfo,
  propertyToUpdate: 'basic' | 'extended' | 'chain'
): void => {
  const dappToUpdate = state.dapps.find((x) => x.basic.address === dapp.chain.address);

  if (dappToUpdate) {
    const index = state.dapps.indexOf(dappToUpdate);
    state.dapps.splice(index, 1, { ...dappToUpdate, [propertyToUpdate]: dapp[propertyToUpdate] });
  } else {
    console.warn(`Dapp with address ${dapp.chain.address} not found in the store.`);
  }
};

const mutations: MutationTree<DappStakingState> & DappStakingMutations = {
  addDapps(state, dapps) {
    state.dapps = dapps;
  },
  addDapp(state, dapp) {
    state.dapps.push(dapp);
  },
  updateDappExtended(state, dapp) {
    const dappToUpdate = state.dapps.find((x) => x.basic.address === dapp.address);

    if (dappToUpdate) {
      const index = state.dapps.indexOf(dappToUpdate);
      state.dapps.splice(index, 1, { ...dappToUpdate, extended: dapp });
    } else {
      console.warn(`Dapp with address ${dapp.address} not found in the store.`);
    }
  },
  updateDappChain(state: DappStakingState, dapp: DappInfo): void {
    const dappToUpdate = state.dapps.find((x) => x.basic.address === dapp.address);

    if (dappToUpdate) {
      const index = state.dapps.indexOf(dappToUpdate);
      state.dapps.splice(index, 1, { ...dappToUpdate, chain: dapp });
    } else {
      console.warn(`Dapp with address ${dapp.address} not found in the store.`);
    }
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
};

export default mutations;
