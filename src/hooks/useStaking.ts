import { useStore } from 'src/store';
import { computed, Ref, watch, ref } from 'vue';
import { contractInstance, Staking } from 'src/config/web3';
import dappsStakingContractAbi from 'src/config/web3/abi/dapps-staking-abi.json';
import { $web3 } from 'boot/api';

export function useStaking() {
  const store = useStore();
  const isH160Formatted = computed(() => store.getters['general/isH160Formatted']);

  // dApps Staking precompiled contract address
  const PRECOMPILED_ADDR = '0x0000000000000000000000000000000000005001';

  const getEraInfo = async (addressRef: Ref<string>) => {
    const result = ref();

    watch(
      () => addressRef.value,
      async () => {
        const ci = contractInstance(
          $web3.value!!,
          dappsStakingContractAbi,
          PRECOMPILED_ADDR,
          addressRef.value
        );
        const staking = new Staking(ci, addressRef.value);

        result.value = {
          currentEra: await staking.getCurrentEra(),
          unbondingPeriod: await staking.getUnbondingPeriod(),
        };
      },
      { immediate: true }
    );

    return { getEraInfo };
  };
}
