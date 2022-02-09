import { useStore } from 'src/store';
import { computed, Ref, watch, ref } from 'vue';
import { getProviderIndex } from 'src/config/chainEndpoints';
import { createWeb3Instance, TNetworkId } from 'src/config/web3';
import { contractInstance } from 'src/config/web3/contracts';
import dappsStakingContractAbi from 'src/config/web3/abi/dapps-staking-abi.json';
import { Staking } from 'src/config/web3/contracts/staking';

export function useStaking() {
  const store = useStore();
  const isH160Formatted = computed(() => store.getters['general/isH160Formatted']);
  const currentNetworkIdx = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });

  // dApps Staking precompiled contract address
  const PRECOMPILED_ADDR = '0x0000000000000000000000000000000000005001';

  const getEraInfo = async (addressRef: Ref<string>) => {
    const result = ref();
    const web3 = await createWeb3Instance(currentNetworkIdx.value as TNetworkId);

    if (!web3) {
      throw Error(`cannot create the web3 instance with network id ${currentNetworkIdx.value}`);
    }

    watch(
      () => addressRef.value,
      async () => {
        const ci = contractInstance(
          web3,
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
