import { MutationTree } from 'vuex';
import { DappStakingState } from './state';
import { AccountLedger, CombinedDappInfo, Dapp, ProtocolState } from '../logic';

export interface DappStakingMutations<S = DappStakingState> {
  addDapps(state: DappStakingState, dapps: CombinedDappInfo[]): void;
  addDapp(state: DappStakingState, dapp: CombinedDappInfo): void;
  updateDappExtended(state: DappStakingState, dapp: Dapp): void;
  setProtocolState(state: DappStakingState, protocolState: ProtocolState): void;
  setLedger(stake: DappStakingState, ledger: AccountLedger): void;
}

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
  setProtocolState(state, protocolState) {
    state.protocolState = protocolState;
  },
  setLedger(state, ledger) {
    state.ledger = ledger;
  },
};

export default mutations;
