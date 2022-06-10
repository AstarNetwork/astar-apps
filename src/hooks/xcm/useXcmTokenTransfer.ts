import { ISubmittableResult } from '@polkadot/types/types';
import BN from 'bn.js';
import { $api, $web3 } from 'boot/api';
import { ethers } from 'ethers';
import { getBalance, isValidEvmAddress, toSS58Address } from 'src/config/web3';
import { useCustomSignature } from 'src/hooks';
import { isValidAddressPolkadotAddress } from 'src/hooks/helper/plasmUtils';
import { useAccount } from 'src/hooks/useAccount';
import { ChainAsset } from 'src/hooks/xcm/useXcmAssets';
import { useStore } from 'src/store';
import { computed, ref, Ref, watchEffect } from 'vue';
import { useGasPrice } from '../useGasPrice';
import { signAndSend } from '../helper/wallet';
import { useI18n } from 'vue-i18n';

export function useXcmTokenTransfer(selectedToken: Ref<ChainAsset>) {
  const transferAmt = ref<string | null>(null);
  const toAddressBalance = ref<number>(0);
  const fromAddressBalance = ref<number>(0);
  const toAddress = ref<string>('');
  const errMsg = ref<string>('');
  const isChecked = ref<boolean>(false);

  const { t } = useI18n();
  const store = useStore();
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const { currentAccount } = useAccount();

  const { handleResult, handleCustomExtrinsic } = useCustomSignature({});
  const { selectedTip, nativeTipPrice, setSelectedTip } = useGasPrice();

  const isDisabledTransfer = computed(() => {
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
    transferAmt.value = selectedToken.value.userBalance;
  };

  const setErrorMsg = (): void => {
    const transferAmtRef = Number(transferAmt.value);
    const fromAccountBalance = selectedToken.value ? Number(selectedToken.value.userBalance) : 0;
    const isValidDestAddress =
      isValidAddressPolkadotAddress(toAddress.value) || isValidEvmAddress(toAddress.value);

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

      // check if recipient account has non-zero native asset. (it cannot be transferred to an account with 0 nonce)
      if (isValidEvmAddress(toAddress)) {
        const balWei = await getBalance($web3.value!, toAddress);
        if (Number(ethers.utils.formatEther(balWei)) === 0) {
          throw Error(t('assets.modals.xcmWarning.nonzeroBalance'));
        }
      } else {
        const balData = ((await $api!.query.system.account(toAddress)) as any).data;
        if (balData.free.toBn().eqn(0)) {
          throw Error(t('assets.modals.xcmWarning.nonzeroBalance'));
        }
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

  watchEffect(() => {
    setErrorMsg();
  });

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
    setSelectedTip,
    inputHandler,
    resetStates,
    toMaxAmount,
    transferAsset,
  };
}
