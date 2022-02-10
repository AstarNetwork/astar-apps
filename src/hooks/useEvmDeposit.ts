import BN from 'bn.js';
import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';
import { useAccount } from '.';
import { $api } from 'boot/api';
import { buildEvmAddress } from 'src/config/web3/utils/convert';

export function useEvmDeposit() {
  const evmDeposit = ref<BN>(new BN(0));
  const isEvmDeposit = ref<boolean>(false);
  const { currentAccount } = useAccount();
  const store = useStore();
  const isLoading = computed(() => store.getters['general/isLoading']);
  const isH160 = computed(() => store.getters['general/isH160Formatted']);

  watch(
    [$api, currentAccount, isLoading],
    async () => {
      const api = $api.value!!;
      const currentAccountVal = currentAccount.value;

      const getData = async (h160Addr: string): Promise<BN> => {
        return await api.rpc.eth.getBalance(h160Addr);
      };

      if (currentAccountVal) {
        const h160Addr = buildEvmAddress(currentAccountVal);
        const deposit = await getData(h160Addr);
        evmDeposit.value = deposit;
        isEvmDeposit.value = deposit.toString() !== '0' && !isH160.value ? true : false;
      }
    },
    { immediate: true }
  );

  return {
    evmDeposit,
    isEvmDeposit,
    currentAccount,
  };
}
