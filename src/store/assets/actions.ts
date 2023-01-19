import { XvmGetAssetsParam } from './../../v2/services/IXvmService';
import { IEvmAssetsService } from 'src/v2/services/IEvmAssetsService';
import { container } from 'src/v2/common';
import { IXcmService, IXvmService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { ActionTree } from 'vuex';
import { StateInterface } from 'src/store';
import { AssetsStateInterface as State } from 'src/store/assets/state';

const actions: ActionTree<State, StateInterface> = {
  async getAssets(
    { commit },
    { address, isFetchUsd }: { address: string; isFetchUsd: boolean }
  ): Promise<void> {
    commit('general/setLoading', true, { root: true });
    try {
      const xcmService = container.get<IXcmService>(Symbols.XcmService);
      const assets = await xcmService.getAssets(address, isFetchUsd);
      commit('setAssets', assets);
    } catch (error) {
      console.error(error);
    } finally {
      commit('general/setLoading', false, { root: true });
    }
  },

  async getXvmAssets({ commit }, param: XvmGetAssetsParam): Promise<void> {
    commit('general/setLoading', true, { root: true });
    try {
      const xvmService = container.get<IXvmService>(Symbols.XvmService);
      const assets = await xvmService.getAssets(param);
      commit('setXvmAssets', assets);
    } catch (error) {
      console.error(error);
    } finally {
      commit('general/setLoading', false, { root: true });
    }
  },

  async getEvmAssets(
    { commit },
    {
      currentAccount,
      srcChainId,
      currentNetworkIdx,
      isFetchUsd,
    }: {
      currentAccount: string;
      srcChainId: number;
      currentNetworkIdx: number;
      isFetchUsd: boolean;
    }
  ): Promise<void> {
    commit('general/setLoading', true, { root: true });
    try {
      const evmAssetsService = container.get<IEvmAssetsService>(Symbols.EvmAssetsService);
      const assets = await evmAssetsService.getAssets(
        currentAccount,
        srcChainId,
        currentNetworkIdx,
        isFetchUsd
      );
      commit('setEvmAssets', assets);
    } catch (error) {
      console.error(error);
    } finally {
      commit('general/setLoading', false, { root: true });
    }
  },
};

export default actions;
