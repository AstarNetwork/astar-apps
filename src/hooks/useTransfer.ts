import type { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types';
import BN from 'bn.js';
import { $api } from 'boot/api';
import {
  buildEvmAddress,
  getDefaultEthProvider,
  isValidEvmAddress,
  sendNativeTokenTransaction,
  toSS58Address,
} from 'src/config/web3';
import { useCustomSignature } from 'src/hooks';
import { isValidAddressPolkadotAddress, reduceDenomToBalance } from 'src/hooks/helper/plasmUtils';
import { getUnit } from 'src/hooks/helper/units';
import { getInjector } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { computed, Ref, ref, watchEffect } from 'vue';
import Web3 from 'web3';
import { getEvmProvider } from './helper/wallet';
import ABI from 'src/c-bridge/abi/ERC20.json';
import { ethers } from 'ethers';
import { TransactionConfig } from 'web3-eth';
import { AbiItem } from 'web3-utils';

export function useTransfer(selectUnit: Ref<string>, decimal: Ref<number>, fn?: () => void) {
  const store = useStore();
  const isH160 = computed(() => store.getters['general/isH160Formatted']);
  const isTxSuccess = ref(false);

  const { callFunc, handleResult, handleTransactionError } = useCustomSignature({ fn });
  const toastInvalidAddress = () =>
    store.dispatch('general/showAlertMsg', {
      msg: 'assets.invalidAddress',
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
            nonce: -1,
            tip: 1,
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
      ).catch((error: any) => {
        isTxSuccess.value = false;
        store.commit('general/setLoading', false);
        store.dispatch('general/showAlertMsg', {
          msg: error.message,
          alertType: 'error',
        });
      });
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

  const callErc20Transfer = async ({
    transferAmt,
    fromAddress,
    toAddress,
    contractAddress,
    decimals,
  }: {
    transferAmt: string;
    fromAddress: string;
    toAddress: string;
    contractAddress: string;
    decimals: number;
  }): Promise<void> => {
    if (!isH160.value) return;
    if (!ethers.utils.isAddress(toAddress)) {
      toastInvalidAddress();
      return;
    }
    const provider = getEvmProvider();
    const web3 = new Web3(provider as any);
    const contract = new web3.eth.Contract(ABI as AbiItem[], contractAddress);
    const gasPrice = await web3.eth.getGasPrice();

    const value = ethers.utils.parseUnits(transferAmt, decimals);

    const rawTx: TransactionConfig = {
      nonce: await web3.eth.getTransactionCount(fromAddress),
      // gasPrice: web3.utils.toHex(gasPrice), // data.fast
      gasPrice: web3.utils.toHex(13256478930), // data.fast
      from: fromAddress,
      to: contractAddress,
      value: '0x0',
      data: contract.methods.transfer(toAddress, value).encodeABI(),
    };

    // const rawTx: TransactionConfig = {
    //   nonce: await web3.eth.getTransactionCount(fromAddress),
    //   gasPrice: web3.utils.toHex(gasPrice),
    //   from: fromAddress,
    //   to: contractAddress,
    //   value: '0x0',
    //   data: contract.methods.transfer(toAddress, value).encodeABI(),
    //   maxPriorityFeePerGas: '12256478930',
    //   maxFeePerGas: '1000000000',
    // };
    const estimatedGas = await web3.eth.estimateGas(rawTx); //29387
    console.log('estimatedGas', estimatedGas);
    await web3.eth
      .sendTransaction({ ...rawTx, gas: estimatedGas })
      .once('transactionHash', (transactionHash) => {
        const msg = `Completed at transaction hash #${transactionHash}`;
        store.dispatch('general/showAlertMsg', { msg, alertType: 'success' });
        store.commit('general/setLoading', false);
        fn && fn();
        isTxSuccess.value = true;
      })
      .catch((error: any) => {
        isTxSuccess.value = false;
        store.commit('general/setLoading', false);
        store.dispatch('general/showAlertMsg', {
          msg: error.message,
          alertType: 'error',
        });
      });
  };

  return { callTransfer, isTxSuccess, callErc20Transfer };
}
