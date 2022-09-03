import { IEvmAssetsService } from 'src/v2/services/IEvmAssetsService';
import { container } from 'src/v2/common';
import { IXcmService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { ActionTree } from 'vuex';
import { StateInterface } from 'src/store';
import { AssetsStateInterface as State } from 'src/store/assets/state';

const actions: ActionTree<State, StateInterface> = {
  async getAssets(
    { commit },
    { address, isFetchUsd }: { address: string; isFetchUsd: boolean }
  ): Promise<void> {
    const xcmService = container.get<IXcmService>(Symbols.XcmService);
    const assets = await xcmService.getAssets(address, isFetchUsd);
    commit('setAssets', assets);
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
    const evmAssetsService = container.get<IEvmAssetsService>(Symbols.EvmAssetsService);
    const assets = await evmAssetsService.getAssets(
      currentAccount,
      srcChainId,
      currentNetworkIdx,
      isFetchUsd
    );
    commit('setEvmAssets', assets);
  },
};

export default actions;
