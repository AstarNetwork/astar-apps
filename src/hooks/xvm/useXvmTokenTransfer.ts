import { ethers } from 'ethers';
import { buildEvmAddress, getTokenBal, isValidEvmAddress } from 'src/config/web3';
import { useBalance, useGasPrice, useNetworkInfo } from 'src/hooks';
import {
  ASTAR_SS58_FORMAT,
  isValidAddressPolkadotAddress,
  SUBSTRATE_SS58_FORMAT,
} from 'src/hooks/helper/plasmUtils';
import { useAccount } from 'src/hooks/useAccount';
import { Erc20Token } from 'src/modules/token';
import { Path } from 'src/router';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import { IXvmService } from 'src/v2/services/IXvmService';
import { Symbols } from 'src/v2/symbols';
import { computed, ref, Ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

type ContractType = 'wasm-erc20' | 'wasm-psp22';

export function useXvmTokenTransfer(selectedToken: Ref<Erc20Token>) {
  const transferAmt = ref<string | null>(null);
  const toAddressBalance = ref<number>(0);
  const toAddress = ref<string>('');
  const errMsg = ref<string>('');
  const isChecked = ref<boolean>(false);
  const xvmContract = ref<ContractType>('wasm-erc20');

  const { t } = useI18n();
  const store = useStore();
  const { currentAccount } = useAccount();
  const { selectedTip, nativeTipPrice, setSelectedTip, isEnableSpeedConfiguration } = useGasPrice();
  const route = useRoute();
  const router = useRouter();
  const { accountData } = useBalance(currentAccount);
  const { evmNetworkIdx, nativeTokenSymbol } = useNetworkInfo();
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
  const tokenSymbol = computed<string>(() => route.query.token as string);
  const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
  const isRequiredCheck = computed<boolean>(() => true);
  const fromAddressBalance = computed<number>(() =>
    selectedToken.value ? Number(selectedToken.value.userBalance) : 0
  );

  const transferableBalance = computed<number>(() => {
    const balance = accountData.value
      ? ethers.utils.formatEther(accountData.value.getUsableTransactionBalance().toString())
      : '0';
    return Number(balance);
  });

  const isDisabledTransfer = computed<boolean>(() => {
    const isLessAmount =
      0 >= Number(transferAmt.value) || fromAddressBalance.value < Number(transferAmt.value);
    const noAddress = !toAddress.value;
    return (
      errMsg.value !== '' ||
      isLessAmount ||
      noAddress ||
      (isRequiredCheck.value && !isChecked.value)
    );
  });

  const isValidDestAddress = computed<boolean>(() => {
    return (
      isValidAddressPolkadotAddress(toAddress.value, ASTAR_SS58_FORMAT) ||
      isValidAddressPolkadotAddress(toAddress.value, SUBSTRATE_SS58_FORMAT) ||
      isValidEvmAddress(toAddress.value)
    );
  });

  const inputHandler = (event: any): void => {
    transferAmt.value = event.target.value;
    errMsg.value = '';
  };

  const resetStates = (): void => {
    transferAmt.value = '';
    toAddress.value = '';
    errMsg.value = '';
    isChecked.value = false;
    toAddressBalance.value = 0;
  };

  const finalizedCallback = (): void => {
    router.push(Path.Assets);
  };

  const toMaxAmount = async (): Promise<void> => {
    transferAmt.value = String(selectedToken.value.userBalance);
  };

  const setErrorMsg = (): void => {
    if (isLoading.value) return;
    const transferAmtRef = Number(transferAmt.value);
    try {
      if (transferAmtRef > fromAddressBalance.value) {
        errMsg.value = t('warning.insufficientBalance', {
          token: selectedToken.value.symbol,
        });
      } else if (toAddress.value && !isValidDestAddress.value) {
        errMsg.value = 'warning.inputtedInvalidDestAddress';
      } else if (!transferableBalance.value) {
        errMsg.value = t('warning.insufficientBalance', {
          token: nativeTokenSymbol.value,
        });
      } else {
        errMsg.value = '';
      }
    } catch (error: any) {
      errMsg.value = error.message;
    }
  };

  const setXvmContract = (): void => {
    if (!toAddress.value) return;
    const isSendToH160 = isValidEvmAddress(toAddress.value);
    xvmContract.value = isSendToH160 ? 'wasm-erc20' : 'wasm-psp22';
  };

  const setToAddressBalance = async (): Promise<void> => {
    if (!isValidDestAddress.value) {
      toAddressBalance.value = 0;
      return;
    }

    try {
      const isSendToH160 = isValidEvmAddress(toAddress.value);
      const destAddress = isSendToH160 ? toAddress.value : buildEvmAddress(toAddress.value);
      const srcChainId = evmNetworkIdx.value;

      const userBalance = await getTokenBal({
        srcChainId,
        address: destAddress,
        tokenAddress: selectedToken.value.address,
        tokenSymbol: selectedToken.value.symbol,
      });

      toAddressBalance.value = Number(userBalance);
    } catch (error) {
      console.error(error);
      toAddressBalance.value = 0;
    }
  };

  const transferAsset = async (): Promise<void> => {
    try {
      const xvmService = container.get<IXvmService>(Symbols.XvmService);
      await xvmService.transfer({
        amount: String(transferAmt.value),
        token: selectedToken.value,
        recipientAddress: buildEvmAddress(toAddress.value),
        senderAddress: currentAccount.value,
        finalizedCallback,
      });
    } catch (e: any) {
      console.error(e);
      store.dispatch('general/showAlertMsg', {
        msg: e.message || 'Something went wrong during asset transfer.',
        alertType: 'error',
      });
      store.commit('general/setLoading', false);
    }
  };

  watchEffect(setErrorMsg);
  watchEffect(setToAddressBalance);
  watch([tokenSymbol], resetStates);
  watch([toAddress], setXvmContract);

  return {
    selectedTip,
    nativeTipPrice,
    transferAmt,
    toAddressBalance,
    fromAddressBalance,
    toAddress,
    errMsg,
    isDisabledTransfer,
    isChecked,
    isH160,
    isRequiredCheck,
    isEnableSpeedConfiguration,
    setSelectedTip,
    inputHandler,
    resetStates,
    toMaxAmount,
    transferAsset,
  };
}
