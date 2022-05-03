import { ISubmittableResult } from '@polkadot/types/types';
import BN from 'bn.js';
import { $api } from 'boot/api';
import { ethers } from 'ethers';
import { buildEvmAddress } from 'src/config/web3';
import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';
import { signAndSend } from './helper/wallet';
import { useAccount } from './index';
import { useCustomSignature } from './useCustomSignature';

export function useEvmDeposit(fn?: () => void) {
  const evmDeposit = ref<BN>(new BN(0));
  const numEvmDeposit = ref<number>(0);
  const isEvmDeposit = ref<boolean>(false);
  const { currentAccount } = useAccount();
  const store = useStore();
  const isLoading = computed(() => store.getters['general/isLoading']);
  const isH160 = computed(() => store.getters['general/isH160Formatted']);

  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const {
    dispatchError,
    isCustomSig,
    handleResult,
    handleTransactionError,
    handleCustomExtrinsic,
  } = useCustomSignature(fn ? { fn } : {});

  const withdraw = async ({ amount, account }: { amount: BN; account: string }) => {
    try {
      const apiRef = $api.value;
      if (!apiRef) {
        throw Error('Cannot connect to the API');
      }

      const h160Addr = buildEvmAddress(account);
      const transaction = await apiRef.tx.evm.withdraw(h160Addr, amount);
      if (!transaction) {
        throw Error('Cannot withdraw the deposit');
      }

      const txResHandler = (result: ISubmittableResult) => {
        handleResult(result);
      };

      await signAndSend({
        transaction,
        senderAddress: account,
        substrateAccounts: substrateAccounts.value,
        isCustomSignature: isCustomSig.value,
        txResHandler,
        dispatchError,
        handleCustomExtrinsic,
      }).catch((error: Error) => {
        handleTransactionError(error);
      });
    } catch (e) {
      console.error(e);
    }
  };

  const sendTransaction = async (amount: number) => {
    if (Number(amount) === 0) {
      store.dispatch('general/showAlertMsg', {
        msg: 'The amount of token to be transmitted must not be zero',
        alertType: 'error',
      });
      return;
    }
    await withdraw({ amount: evmDeposit.value, account: currentAccount.value });
  };

  watch(
    [$api, currentAccount, isLoading],
    async () => {
      const apiRef = $api.value;
      const currentAccountRef = currentAccount.value;
      if (!apiRef || !currentAccountRef) return;

      const getData = async (h160Addr: string): Promise<BN> => {
        return await apiRef.rpc.eth.getBalance(h160Addr);
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
    evmDeposit,
    isEvmDeposit,
    currentAccount,
    sendTransaction,
  };
}
