import BN from 'bn.js';
import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';
import { useAccount } from './index';
import { $api } from 'boot/api';
import { buildEvmAddress } from 'src/config/web3';
import { ethers } from 'ethers';
import type { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { useCustomSignature } from './useCustomSignature';
import { getInjector } from './helper/wallet';

export function useEvmDeposit(fn?: () => void) {
  const evmDeposit = ref<BN>(new BN(0));
  const numEvmDeposit = ref<number>(0);
  const isEvmDeposit = ref<boolean>(false);
  const { currentAccount } = useAccount();
  const store = useStore();
  const isLoading = computed(() => store.getters['general/isLoading']);
  const isH160 = computed(() => store.getters['general/isH160Formatted']);

  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const { callFunc, dispatchError, isCustomSig, handleResult, handleTransactionError } =
    useCustomSignature(fn ? { fn } : {});

  const withdrawCustomExtrinsic = async ({ amount, account }: { amount: BN; account: string }) => {
    try {
      const h160Addr = buildEvmAddress(account);
      const fn: SubmittableExtrinsicFunction<'promise'> | undefined = $api?.tx.evm.withdraw;
      const method: SubmittableExtrinsic<'promise'> | undefined = fn && fn(h160Addr, amount);
      method && callFunc(method);
    } catch (e) {
      dispatchError((e as Error).message);
    }
  };

  const withdraw = async ({ amount, account }: { amount: BN; account: string }) => {
    try {
      const apiRef = $api;
      if (!apiRef) {
        throw Error('Cannot connect to the API');
      }
      const injector = await getInjector(substrateAccounts.value);
      if (!injector) {
        throw Error('Cannot reach to the injector');
      }
      const h160Addr = buildEvmAddress(account);
      const transaction = await apiRef.tx.evm.withdraw(h160Addr, amount);
      if (!transaction) {
        throw Error('Cannot withdraw the deposit');
      }
      transaction
        .signAndSend(
          account,
          {
            signer: injector.signer,
            nonce: -1,
            tip: 1,
          },
          (result) => handleResult(result)
        )
        .catch((error: Error) => handleTransactionError(error));
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
    if (isCustomSig.value) {
      await withdrawCustomExtrinsic({ amount: evmDeposit.value, account: currentAccount.value });
    } else {
      await withdraw({ amount: evmDeposit.value, account: currentAccount.value });
    }
  };

  watch(
    [$api, currentAccount, isLoading],
    async () => {
      const apiRef = $api;
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
