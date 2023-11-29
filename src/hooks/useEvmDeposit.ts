import { buildEvmAddress } from '@astar-network/astar-sdk-core';
import { $web3 } from 'boot/api';
import { ethers } from 'ethers';
import { useAccount, useGasPrice } from 'src/hooks';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import { IAssetsService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { computed, ref, watch } from 'vue';

export function useEvmDeposit() {
  const evmDeposit = ref<string>('0');
  const numEvmDeposit = ref<number>(0);
  const isEvmDeposit = ref<boolean>(false);
  const { currentAccount } = useAccount();
  const store = useStore();
  const isLoading = computed(() => store.getters['general/isLoading']);
  const isH160 = computed(() => store.getters['general/isH160Formatted']);
  const { selectedTip, nativeTipPrice, setSelectedTip } = useGasPrice();

  const sendTransaction = async () => {
    const assetsService = container.get<IAssetsService>(Symbols.AssetsService);
    await assetsService.evmWithdraw({
      amount: evmDeposit.value,
      senderAddress: currentAccount.value,
    });
  };

  watch(
    [currentAccount, isLoading],
    async () => {
      const currentAccountRef = currentAccount.value;
      if (!currentAccountRef) return;

      const getData = async (h160Addr: string): Promise<string> => {
        return (await $web3.value?.eth.getBalance(h160Addr)) || '0';
      };

      if (currentAccountRef) {
        const h160Addr = buildEvmAddress(currentAccountRef);
        const deposit = await getData(h160Addr);
        evmDeposit.value = deposit;
        numEvmDeposit.value = Number(ethers.utils.formatEther(deposit.toString()));
        isEvmDeposit.value = deposit.toString() !== '0' && !isH160.value ? true : false;
      }
    },
    { immediate: true }
  );

  return {
    numEvmDeposit,
    isEvmDeposit,
    currentAccount,
    sendTransaction,
    selectedTip,
    nativeTipPrice,
    setSelectedTip,
  };
}
