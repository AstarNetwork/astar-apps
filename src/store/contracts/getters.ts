import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { ContractsStateInterface as State, CodeStored } from './state';

export interface ContractsGetters {
  hasCode(state: State): boolean;
  getAllCode(state: State): CodeStored[];
  getCode(state: State, codeHash: string): CodeStored | undefined;
}

const getters: GetterTree<State, StateInterface> & ContractsGetters = {
  hasCode: (state) => Object.keys(state.allCode).length !== 0,
  getAllCode: (state) => Object.values(state.allCode),
  getCode: (state, codeHash) => state.allCode[codeHash],
};

export default getters;
