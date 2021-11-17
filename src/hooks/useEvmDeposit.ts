import BN from 'bn.js';
import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';
import { useAccount, useApi } from '.';
import { toEvmAddress } from './helper/plasmUtils';

export function useEvmDeposit() {
  const evmDeposit = ref<BN>(new BN(0));
  const isEvmDeposit = ref<boolean>(false);
  const { api } = useApi();
  const { currentAccount } = useAccount();
  const store = useStore();
  const isLoading = computed(() => store.getters['general/isLoading']);

  watch(
    [api, currentAccount, isLoading],
    () => {
      const apiRef = api && api.value;
      const currentAccountRef = currentAccount.value;
      if (!apiRef || !currentAccountRef) return;

      const getData = async (h160Addr: string): Promise<BN> => {
        return await apiRef.rpc.eth.getBalance(h160Addr);
      };

      apiRef.isReady.then(() => {
        (async () => {
          const h160Addr = toEvmAddress(currentAccountRef);
          const deposit = await getData(h160Addr);
          evmDeposit.value = deposit;
          if (deposit.toString() !== '0') {
            isEvmDeposit.value = true;
          } else {
            isEvmDeposit.value = false;
          }
        })();
      });
    },
    { immediate: true }
  );

  return {
    evmDeposit,
    isEvmDeposit,
    currentAccount,
  };
}
