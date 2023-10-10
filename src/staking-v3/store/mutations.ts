import { MutationTree } from 'vuex';
import { DappStakingState } from './state';

export interface DappStakingMutations<S = DappStakingState> {}

const mutations: MutationTree<DappStakingState> & DappStakingMutations = {};

export default mutations;
