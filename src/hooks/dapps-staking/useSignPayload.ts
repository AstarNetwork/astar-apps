import { computed } from 'vue';
import { $api } from 'src/boot/api';
import { getInjector } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';

export function useSignPayload() {
  const store = useStore();
  const selectedAddress = computed(() => store.getters['general/selectedAddress']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);

  // TODO discuss if support Metamask for lockdrop accounts is needed
  const signPayload = async (contractAddress: string): Promise<string> => {
    const payload = $api?.tx.dappsStaking.register({ Evm: contractAddress }).toHex();
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
