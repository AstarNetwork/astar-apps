import { computed } from 'vue';
import { hasProperty } from '@astar-network/astar-sdk-core';
import { Bool } from '@polkadot/types';
import { $api } from 'boot/api';
import { useStore } from 'src/store';

export function useDecommission() {
  const store = useStore();

  const decommissionStarted = computed<boolean>(() => store.getters['dapps/getDecommission']);

  const fetchDecommissionStatusToStore = async (): Promise<void> => {
    const decommissionStarted =
      $api && hasProperty($api.query.dappsStaking, 'decommissionStarted')
        ? (await $api?.query?.dappsStaking?.decommissionStarted<Bool>()).isTrue
        : false;

    // store.commit('dapps/setDecommission', true);
    store.commit('dapps/setDecommission', decommissionStarted);
  };

  return { decommissionStarted, fetchDecommissionStatusToStore };
}
