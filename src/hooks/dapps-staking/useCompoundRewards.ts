import { ref, computed } from 'vue';
import { $api } from 'boot/api';
import { useStore } from 'src/store';
import e from 'express';

export function useCompoundRewards() {
  const isSupported = ref<boolean>(false);
  const store = useStore();
  const currentAddress = computed(() => store.getters['general/selectedAddress']);

  const getCompoundingType = async () => {
    try {
      const ledger = await $api.value?.query.dappsStaking.ledger(currentAddress.value);

      if (ledger) {
        // const rewardDestination = ledger.rewardDestination;
        isSupported.value = true;
      } else {
        isSupported.value = false;
      }
    } catch (err) {
      // Compounding rewards are not supported if reading of ledger.rewardDestination fails.
      console.warn(err);
      isSupported.value = false;
    }
  };

  getCompoundingType();

  return {
    isEnabled: isSupported,
  };
}
