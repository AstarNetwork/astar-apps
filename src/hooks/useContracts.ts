import { reactive, watchEffect, toRefs } from 'vue';

import { keyring } from '@polkadot/ui-keyring';

interface UseContracts {
  allContracts: string[];
  hasContracts: boolean;
  isContract: (address: string) => boolean;
}

const DEFAULT_STATE: UseContracts = {
  allContracts: [],
  hasContracts: false,
  isContract: () => false,
};

export function useContracts() {
  const state = reactive<UseContracts>(DEFAULT_STATE);

  watchEffect((onInvalidate) => {
    const subscription = keyring.contracts.subject.subscribe((contracts): void => {
      const allContracts = contracts ? Object.keys(contracts) : [];
      const hasContracts = allContracts.length !== 0;
      const isContract = (address: string) => allContracts.includes(address);

      state.allContracts = allContracts;
      state.hasContracts = hasContracts;
      state.isContract = isContract;
    });

    onInvalidate(() => {
      subscription.unsubscribe();
    });
  });

  return toRefs(state);
}
