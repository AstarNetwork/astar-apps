import { ISubmittableResult } from '@polkadot/types/types';
import { ethers } from 'ethers';
import { buildEvmAddress, getTokenBal, isValidEvmAddress, toSS58Address } from 'src/config/web3';
import { useCustomSignature, useGasPrice, useNetworkInfo } from 'src/hooks';
import { useEthProvider } from 'src/hooks/custom-signature/useEthProvider';
import {
  ASTAR_SS58_FORMAT,
  isValidAddressPolkadotAddress,
  SUBSTRATE_SS58_FORMAT,
} from 'src/hooks/helper/plasmUtils';
import { useAccount } from 'src/hooks/useAccount';
import { XvmAsset } from 'src/modules/token';
import { Path } from 'src/router';
import { useStore } from 'src/store';
import { SubstrateAccount } from 'src/store/general/state';
import { computed, ref, Ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

export function useXvmTokenTransfer(selectedToken: Ref<XvmAsset>) {
  const transferAmt = ref<string | null>(null);
  const toAddressBalance = ref<number>(0);
  const toAddress = ref<string>('');
  const errMsg = ref<string>('');
  const isChecked = ref<boolean>(false);

  const store = useStore();
  const { ethProvider } = useEthProvider();
  const { currentAccount } = useAccount();
  const { handleResult, handleCustomExtrinsic } = useCustomSignature({});
  const { selectedTip, nativeTipPrice, setSelectedTip, isEnableSpeedConfiguration } = useGasPrice();
  const route = useRoute();
  const router = useRouter();

  const { evmNetworkIdx } = useNetworkInfo();
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
  const tokenSymbol = computed<string>(() => route.query.token as string);
  const isEthWallet = computed<boolean>(() => store.getters['general/isEthWallet']);
  const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
  const substrateAccounts = computed<SubstrateAccount[]>(
    () => store.getters['general/substrateAccounts']
  );

  const isRequiredCheck = computed<boolean>(() => true);

  const fromAddressBalance = computed<number>(() =>
    selectedToken.value ? Number(selectedToken.value.userBalance) : 0
  );

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

  const finalizeCallback = (): void => {
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
        errMsg.value = 'warning.insufficientBalance';
      } else if (toAddress.value && !isValidDestAddress.value) {
        errMsg.value = 'warning.inputtedInvalidDestAddress';
      } else {
        errMsg.value = '';
      }
    } catch (error: any) {
      errMsg.value = error.message;
    }
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
        tokenAddress: selectedToken.value.erc20Contract,
        tokenSymbol: selectedToken.value.symbol,
      });

      toAddressBalance.value = Number(userBalance);
    } catch (error) {
      console.error(error);
      toAddressBalance.value = 0;
    }
  };

  const transferAsset = async ({
    transferAmt,
    toAddress,
  }: {
    transferAmt: number;
    toAddress: string;
  }): Promise<void> => {
    if (!selectedToken?.value) {
      throw Error('Token is not selected');
    }

    const receivingAddress = isValidEvmAddress(toAddress) ? toSS58Address(toAddress) : toAddress;
    const txResHandler = async (result: ISubmittableResult): Promise<boolean> => {
      const res = await handleResult(result);
      finalizeCallback();
      return res;
    };

    const decimals = Number(selectedToken.value.decimal);
    const amount = ethers.utils.parseUnits(String(transferAmt), decimals).toString();

    const callTransfer = async (): Promise<void> => {
      // if (isTransferNativeToken.value) {
      //   const transaction = $api!.tx.balances.transfer(receivingAddress, amount);
      //   await signAndSend({
      //     transaction,
      //     senderAddress: currentAccount.value,
      //     substrateAccounts: substrateAccounts.value,
      //     isCustomSignature: isEthWallet.value,
      //     txResHandler,
      //     handleCustomExtrinsic,
      //     dispatch: store.dispatch,
      //     tip: selectedTip.value.price,
      //     txType: HistoryTxType.Transfer,
      //   });
      // } else {
      //   const transaction = $api!.tx.assets.transfer(
      //     new BN(selectedToken.value.id),
      //     receivingAddress,
      //     amount
      //   );
      //   await signAndSend({
      //     transaction,
      //     senderAddress: currentAccount.value,
      //     substrateAccounts: substrateAccounts.value,
      //     isCustomSignature: false,
      //     txResHandler,
      //     handleCustomExtrinsic,
      //     dispatch: store.dispatch,
      //     tip: selectedTip.value.price,
      //     txType: HistoryTxType.Transfer,
      //   });
      // }
    };

    try {
      await callTransfer();
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
