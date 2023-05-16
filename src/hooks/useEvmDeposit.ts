import { signAndSend } from 'src/hooks/helper/wallet';
import { useI18n } from 'vue-i18n';
import { useGasPrice, useCustomSignature, useAccount } from 'src/hooks';
import { ISubmittableResult } from '@polkadot/types/types';
import { $api, $web3 } from 'boot/api';
import { ethers } from 'ethers';
import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';
import { buildEvmAddress } from '@astar-network/astar-sdk-core';

export function useEvmDeposit(fn?: () => void) {
  const evmDeposit = ref<string>('0');
  const numEvmDeposit = ref<number>(0);
  const isEvmDeposit = ref<boolean>(false);
  const { currentAccount } = useAccount();
  const store = useStore();
  const { t } = useI18n();
  const isLoading = computed(() => store.getters['general/isLoading']);
  const isH160 = computed(() => store.getters['general/isH160Formatted']);
  const { selectedTip, nativeTipPrice, setSelectedTip } = useGasPrice();

  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const { isCustomSig, handleResult, handleCustomExtrinsic } = useCustomSignature(fn ? { fn } : {});

  const withdraw = async ({ amount, account }: { amount: string; account: string }) => {
    try {
      const h160Addr = buildEvmAddress(account);
      const transaction = $api!.tx.evm.withdraw(h160Addr, amount);
      if (!transaction) {
        throw Error('Cannot withdraw the deposit');
      }

      const txResHandler = async (result: ISubmittableResult): Promise<boolean> => {
        return await handleResult(result);
      };

      await signAndSend({
        transaction,
        senderAddress: account,
        substrateAccounts: substrateAccounts.value,
        isCustomSignature: isCustomSig.value,
        txResHandler,
        handleCustomExtrinsic,
        dispatch: store.dispatch,
        tip: selectedTip.value.price,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const sendTransaction = async (amount: number) => {
    if (Number(amount) === 0) {
      store.dispatch('general/showAlertMsg', {
        msg: t('toast.amountMustNotBeZero'),
        alertType: 'error',
      });
      return;
    }
    await withdraw({ amount: evmDeposit.value, account: currentAccount.value });
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
