import { computed, watchEffect, Ref, ref } from 'vue';
import { $api } from 'boot/api';
import BN from 'bn.js';
import type { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { useStore } from 'src/store';
import { useCustomSignature } from 'src/hooks';
import {
  isValidEvmAddress,
  toSS58Address,
  buildEvmAddress,
  getDefaultEthProvider,
  sendNativeTokenTransaction,
} from 'src/config/web3';
import { isValidAddressPolkadotAddress, reduceDenomToBalance } from 'src/hooks/helper/plasmUtils';
import { getUnit } from 'src/hooks/helper/units';
import { getInjector } from 'src/hooks/helper/wallet';

export function useTransfer(selectUnit: Ref<string>, decimal: Ref<number>, fn?: () => void) {
  const store = useStore();
  const isH160 = computed(() => store.getters['general/isH160Formatted']);
  const isTxSuccess = ref(false);

  const { callFunc, handleResult, handleTransactionError } = useCustomSignature(fn);
  const toastInvalidAddress = () =>
    store.dispatch('general/showAlertMsg', {
      msg: 'balance.modals.invalidAddress',
      alertType: 'error',
    });
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const isEthWallet = computed(() => store.getters['general/isEthWallet']);

  const transferLocal = async (transferAmt: BN, fromAddress: string, toAddress: string) => {
    try {
      const injector = await getInjector(substrateAccounts.value);
      const transfer = await $api?.value?.tx.balances.transfer(toAddress, transferAmt);
      transfer
        ?.signAndSend(
          fromAddress,
          {
            signer: injector?.signer,
          },
          (result) => {
            handleResult(result);
            isTxSuccess.value = true;
          }
        )
        .catch((error: Error) => {
          handleTransactionError(error);
          isTxSuccess.value = false;
        });
    } catch (e) {
      console.error(e);
      isTxSuccess.value = false;
    }
  };

  const transferExtrinsic = async (transferAmt: BN, toAddress: string) => {
    try {
      const fn: SubmittableExtrinsicFunction<'promise'> | undefined =
        $api?.value?.tx.balances.transfer;
      const method: SubmittableExtrinsic<'promise'> | undefined = fn && fn(toAddress, transferAmt);

      method && callFunc(method);
      isTxSuccess.value = true;
    } catch (e) {
      console.error(e);
      store.dispatch('general/showAlertMsg', {
        msg: (e as Error).message,
        alertType: 'error',
      });
      isTxSuccess.value = false;
    }
  };

  const callTransfer = async (transferAmt: number, fromAddress: string, toAddress: string) => {
    if (isH160.value) {
      const destinationAddress = buildEvmAddress(toAddress);
      if (!destinationAddress) {
        toastInvalidAddress();
        return;
      }

      store.commit('general/setLoading', true);
      try {
        const web3 = getDefaultEthProvider();
        sendNativeTokenTransaction(
          web3,
          fromAddress,
          destinationAddress,
          transferAmt,
          (hash: string) => {
            const msg = `Completed at transaction hash #${hash}`;
            store.dispatch('general/showAlertMsg', { msg, alertType: 'success' });
            store.commit('general/setLoading', false);
            fn && fn();

            isTxSuccess.value = true;
          }
        );
      } catch (error) {
        console.error(error);
        store.commit('general/setLoading', false);
        isTxSuccess.value = false;
      }
    } else {
      const isValidSS58Address =
        isValidAddressPolkadotAddress(fromAddress) && isValidAddressPolkadotAddress(toAddress);

      if (!isValidSS58Address && !isValidEvmAddress(toAddress)) {
        toastInvalidAddress();
        return;
      }

      const receivingAddress = isValidEvmAddress(toAddress) ? toSS58Address(toAddress) : toAddress;
      // console.log('receivingAddress', receivingAddress);

      watchEffect(async () => {
        const unit = getUnit(selectUnit.value);
        const toAmt = reduceDenomToBalance(transferAmt, unit, decimal.value);
        // console.log('toAmt', toAmt.toString(10));

        if (isEthWallet.value) {
          await transferExtrinsic(toAmt, receivingAddress);
        } else {
          await transferLocal(toAmt, fromAddress, receivingAddress);
        }
      });
    }
  };

  return { callTransfer, isTxSuccess };
}
