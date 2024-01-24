import { computed } from 'vue';
import { hasProperty } from '@astar-network/astar-sdk-core';
import { Bool } from '@polkadot/types';
import { $api } from 'boot/api';
import { useStore } from 'src/store';
import { LOCAL_STORAGE } from 'src/config/localStorage';

export function useDecommission() {
  const store = useStore();

  const decommissionStarted = computed<boolean>(() => store.getters['dapps/getDecommission']);

  const isInLocalStorage = computed<boolean>(
    () => localStorage.getItem(LOCAL_STORAGE.DECOMMISSION) === 'true'
  );

  const fetchDecommissionStatusToStore = async (): Promise<void> => {
    const decommissionStarted =
      $api && hasProperty($api.query.dappsStaking, 'decommissionStarted')
        ? (await $api?.query?.dappsStaking?.decommissionStarted<Bool>()).isTrue
        : false;

    store.commit('dapps/setDecommission', decommissionStarted);
  };

  const setToLocalStorage = (value: boolean): void =>
    localStorage.setItem(LOCAL_STORAGE.DECOMMISSION, value.toString());

  return {
    decommissionStarted,
    isInLocalStorage,
    fetchDecommissionStatusToStore,
    setToLocalStorage,
  };
}
