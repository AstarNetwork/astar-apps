import { SUBSTRATE_SS58_FORMAT } from './../helper/plasmUtils';
import { ISubmittableResult } from '@polkadot/types/types';
import BN from 'bn.js';
import { $api } from 'boot/api';
import { ethers } from 'ethers';
import { isValidEvmAddress, toSS58Address } from 'src/config/web3';
import { useCustomSignature } from 'src/hooks';
import { isValidAddressPolkadotAddress, ASTAR_SS58_FORMAT } from 'src/hooks/helper/plasmUtils';
import { useAccount } from 'src/hooks/useAccount';
import { fetchXcmBalance } from 'src/modules/xcm';
import { useStore } from 'src/store';
import { Asset } from 'src/v2/models';
import { computed, ref, Ref, watchEffect, watch } from 'vue';
import { signAndSend } from '../helper/wallet';
import { useGasPrice } from '../useGasPrice';

export function useXcmTokenTransfer(selectedToken: Ref<Asset>) {
  const transferAmt = ref<string | null>(null);
  const toAddressBalance = ref<number>(0);
  const toAddress = ref<string>('');
  const errMsg = ref<string>('');
  const isChecked = ref<boolean>(false);

  const store = useStore();
  const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const { currentAccount } = useAccount();

  const { handleResult, handleCustomExtrinsic } = useCustomSignature({});
  const { selectedTip, nativeTipPrice, setSelectedTip } = useGasPrice();

  const isDisabledTransfer = computed<boolean>(() => {
    const isLessAmount =
      0 >= Number(transferAmt.value) ||
      Number(selectedToken.value.userBalance) < Number(transferAmt.value);
    const noAddress = !toAddress.value;

    return errMsg.value !== '' || isLessAmount || noAddress || !isChecked.value;
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

  const toMaxAmount = async (): Promise<void> => {
    transferAmt.value = String(selectedToken.value.userBalance);
  };

  const setErrorMsg = (): void => {
    if (isLoading.value) return;
    const transferAmtRef = Number(transferAmt.value);
    const fromAccountBalance = selectedToken.value ? Number(selectedToken.value.userBalance) : 0;
    const isValidDestAddress =
      isValidAddressPolkadotAddress(toAddress.value, ASTAR_SS58_FORMAT) ||
      isValidAddressPolkadotAddress(toAddress.value, SUBSTRATE_SS58_FORMAT) ||
      isValidEvmAddress(toAddress.value);

    try {
      if (transferAmtRef > fromAccountBalance) {
        errMsg.value = 'warning.insufficientBalance';
      } else if (toAddress.value && !isValidDestAddress) {
        errMsg.value = 'warning.inputtedInvalidDestAddress';
      } else {
        errMsg.value = '';
      }
    } catch (error: any) {
      errMsg.value = error.message;
    }
  };

  const transferAsset = async ({
    transferAmt,
    toAddress,
    finalizeCallback,
  }: {
    transferAmt: number;
    toAddress: string;
    finalizeCallback: () => Promise<void>;
  }): Promise<void> => {
    try {
      if (!selectedToken?.value) {
        throw Error('Token is not selected');
      }

      const receivingAddress = isValidEvmAddress(toAddress) ? toSS58Address(toAddress) : toAddress;

      const txResHandler = async (result: ISubmittableResult): Promise<boolean> => {
        const res = await handleResult(result);
        await finalizeCallback();
        return res;
      };

      const decimals = Number(selectedToken.value.metadata.decimals);
      const amount = ethers.utils.parseUnits(String(transferAmt), decimals).toString();
      const transaction = $api!.tx.assets.transfer(
        new BN(selectedToken.value.id),
        receivingAddress,
        amount
      );

      await signAndSend({
        transaction,
        senderAddress: currentAccount.value,
        substrateAccounts: substrateAccounts.value,
        isCustomSignature: false, // isEthWallet.value - ATM we can't send assets from EVM account,
        txResHandler,
        handleCustomExtrinsic,
        dispatch: store.dispatch,
        tip: selectedTip.value.price,
      });
    } catch (e: any) {
      console.error(e);
      store.dispatch('general/showAlertMsg', {
        msg: e.message || 'Something went wrong during asset transfer.',
        alertType: 'error',
      });
    }
  };

  const setToAddressBalance = async (): Promise<void> => {
    const isValidAddress =
      isValidEvmAddress(toAddress.value) || isValidAddressPolkadotAddress(toAddress.value);
    if (!isValidAddress) return;

    const isSendToH160 = isValidEvmAddress(toAddress.value);
    const destAddress = isSendToH160 ? toSS58Address(toAddress.value) : toAddress.value;
    const { userBalance } = await fetchXcmBalance({
      token: selectedToken.value,
      userAddress: destAddress,
      api: $api!,
    });
    toAddressBalance.value = Number(userBalance);
  };

  watchEffect(setErrorMsg);
  watchEffect(setToAddressBalance);
  watch([selectedToken], resetStates);

  return {
    selectedTip,
    nativeTipPrice,
    transferAmt,
    toAddressBalance,
    toAddress,
    errMsg,
    isDisabledTransfer,
    isChecked,
    setSelectedTip,
    inputHandler,
    resetStates,
    toMaxAmount,
    transferAsset,
  };
}
