import { computed } from 'vue';
import { $api } from 'src/boot/api';
import { getInjector } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { getDappAddressEnum } from '@astar-network/astar-sdk-core';
import { useDappStaking } from 'src/staking-v3';

export function useSignPayload() {
  const store = useStore();
  const { isDappStakingV3 } = useDappStaking();
  const selectedAddress = computed(() => store.getters['general/selectedAddress']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);

  const signPayload = async (
    developerAddress: string,
    contractAddress: string
  ): Promise<string> => {
    const payload = $api?.tx[isDappStakingV3 ? 'dappStaking' : 'dappsStaking']
      .register(developerAddress, getDappAddressEnum(contractAddress))
      .toHex();
    const injector = await getInjector(substrateAccounts.value);

    const result = await injector.signer.signRaw({
      address: selectedAddress.value,
      data: payload,
      type: 'bytes',
    });

    return result.signature;
  };

  return {
    signPayload,
  };
}
