import { buildEvmAddress } from 'src/config/web3';
import { ISubmittableResult } from '@polkadot/types/types';
import { BN } from '@polkadot/util';
import { $api, $web3 } from 'boot/api';
import { ethers } from 'ethers';
import ABI from 'src/config/abi/ERC20.json';
import { getTokenBal, isValidEvmAddress, toSS58Address } from 'src/config/web3';
import { useCustomSignature, useNetworkInfo, useGasPrice } from 'src/hooks';
import { ASTAR_SS58_FORMAT, isValidAddressPolkadotAddress } from 'src/hooks/helper/plasmUtils';
import { useAccount } from 'src/hooks/useAccount';
import { HistoryTxType } from 'src/modules/account';
import { sampleEvmWalletAddress } from 'src/modules/gas-api';
import { fetchXcmBalance } from 'src/modules/xcm';
import { useStore } from 'src/store';
import { Asset } from 'src/v2/models';
import { computed, ref, Ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { useEthProvider } from 'src/hooks/custom-signature/useEthProvider';
import { addTxHistories } from 'src/modules/account/utils/index';
import { getEvmGas, getEvmGasCost } from 'src/modules/gas-api/utils/index';
import { SUBSTRATE_SS58_FORMAT } from 'src/hooks/helper/plasmUtils';
import { signAndSend } from 'src/hooks/helper/wallet';
import { SubstrateAccount } from 'src/store/general/state';
import { Path } from 'src/router';
import { getStoredXvmTokens } from 'src/modules/token';

export function useTokenTransfer(selectedToken: Ref<Asset>) {
  const transferAmt = ref<string | null>(null);
  const toAddressBalance = ref<number>(0);
  const toAddress = ref<string>('');
  const errMsg = ref<string>('');
  const isChecked = ref<boolean>(false);
  const isCheckedXvm = ref<boolean>(false);

  const store = useStore();
  const { ethProvider } = useEthProvider();
  const { t } = useI18n();
  const { currentAccount } = useAccount();
  const { handleResult, handleCustomExtrinsic } = useCustomSignature({});
  const {
    evmGasPrice,
    selectedGas,
    setSelectedGas,
    evmGasCost,
    selectedTip,
    nativeTipPrice,
    setSelectedTip,
  } = useGasPrice();
  const route = useRoute();
  const router = useRouter();

  const { nativeTokenSymbol, evmNetworkIdx } = useNetworkInfo();
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
  const tokenSymbol = computed<string>(() => route.query.token as string);
  const isEthWallet = computed<boolean>(() => store.getters['general/isEthWallet']);
  const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
  const substrateAccounts = computed<SubstrateAccount[]>(
    () => store.getters['general/substrateAccounts']
  );

  const isTransferNativeToken = computed<boolean>(
    () => tokenSymbol.value === nativeTokenSymbol.value.toLowerCase()
  );

  const isRequiredCheck = computed<boolean>(() => isH160.value || !isTransferNativeToken.value);

  const isRequiredCheckXvm = computed<boolean>(() => {
    let result = false;
    const isCheckAddressFormat =
      isH160.value &&
      selectedToken.value.metadata.symbol.toLowerCase() !== nativeTokenSymbol.value.toLowerCase();
    if (isCheckAddressFormat) {
      result = isValidAddressPolkadotAddress(toAddress.value);
    }
    return result;
  });

  const fromAddressBalance = computed<number>(() =>
    selectedToken.value ? selectedToken.value.userBalance : 0
  );

  const isDisabledTransfer = computed<boolean>(() => {
    const isLessAmount =
      0 >= Number(transferAmt.value) || fromAddressBalance.value < Number(transferAmt.value);
    const noAddress = !toAddress.value;
    return (
      errMsg.value !== '' ||
      isLessAmount ||
      noAddress ||
      (isRequiredCheck.value && !isChecked.value) ||
      (isRequiredCheckXvm.value && !isCheckedXvm.value)
    );
  });

  const isValidDestAddress = computed<boolean>(() => {
    const isOnlyAcceptEvmAddress =
      isH160.value && !isTransferNativeToken.value && !isRequiredCheckXvm.value;
    return isOnlyAcceptEvmAddress
      ? isValidEvmAddress(toAddress.value)
      : isValidAddressPolkadotAddress(toAddress.value, ASTAR_SS58_FORMAT) ||
          isValidAddressPolkadotAddress(toAddress.value, SUBSTRATE_SS58_FORMAT) ||
          isValidEvmAddress(toAddress.value);
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
    isCheckedXvm.value = false;
    toAddressBalance.value = 0;
  };

  const finalizeCallback = (): void => {
    router.push(Path.Assets);
  };

  const toastInvalidAddress = () =>
    store.dispatch('general/showAlertMsg', {
      msg: 'assets.invalidAddress',
      alertType: 'error',
    });

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

  const callH160NativeTransfer = async ({
    transferAmt,
    fromAddress,
    toAddress,
    web3,
    gasPrice,
    finalizeCallback,
  }: {
    transferAmt: number;
    fromAddress: string;
    toAddress: string;
    web3: Web3;
    gasPrice: string;
    finalizeCallback: () => void;
  }): Promise<void> => {
    const destinationAddress = buildEvmAddress(toAddress);
    if (!ethers.utils.isAddress(destinationAddress)) {
      toastInvalidAddress();
      return;
    }
    const rawTx: TransactionConfig = {
      nonce: await web3.eth.getTransactionCount(fromAddress),
      gasPrice: web3.utils.toHex(gasPrice),
      from: fromAddress,
      to: destinationAddress,
      value: web3.utils.toWei(String(transferAmt), 'ether'),
    };

    const estimatedGas = await web3.eth.estimateGas(rawTx);

    await web3.eth
      .sendTransaction({ ...rawTx, gas: estimatedGas })
      .once('transactionHash', (transactionHash) => {
        store.commit('general/setLoading', true);
      })
      .then(({ transactionHash }) => {
        store.dispatch('general/showAlertMsg', {
          msg: t('toast.completedTxHash', { hash: transactionHash }),
          alertType: 'success',
        });
        store.commit('general/setLoading', false);
        addTxHistories({
          hash: transactionHash,
          type: HistoryTxType.Transfer,
          address: fromAddress,
        });
        finalizeCallback();
      })
      .catch((error: any) => {
        console.error(error);
        store.commit('general/setLoading', false);
        store.dispatch('general/showAlertMsg', {
          msg: error.message,
          alertType: 'error',
        });
      });
  };

  const callErc20Transfer = async ({
    transferAmt,
    fromAddress,
    toAddress,
    contractAddress,
    gasPrice,
    web3,
    finalizeCallback,
  }: {
    transferAmt: string;
    fromAddress: string;
    toAddress: string;
    contractAddress: string;
    gasPrice: string;
    web3: Web3;
    finalizeCallback: () => void;
  }): Promise<void> => {
    if (!isH160.value) return;
    const destAddress = isRequiredCheckXvm.value ? buildEvmAddress(toAddress) : toAddress;
    if (!ethers.utils.isAddress(destAddress)) {
      toastInvalidAddress();
      return;
    }
    const contract = new web3.eth.Contract(ABI as AbiItem[], contractAddress);

    const rawTx: TransactionConfig = {
      nonce: await web3.eth.getTransactionCount(fromAddress),
      gasPrice: web3.utils.toHex(gasPrice),
      from: fromAddress,
      to: contractAddress,
      value: '0x0',
      data: contract.methods.transfer(destAddress, transferAmt).encodeABI(),
    };

    const estimatedGas = await web3.eth.estimateGas(rawTx);
    await web3.eth
      .sendTransaction({ ...rawTx, gas: estimatedGas })
      .once('transactionHash', (transactionHash) => {
        store.commit('general/setLoading', true);
      })
      .then(({ transactionHash }) => {
        store.dispatch('general/showAlertMsg', {
          msg: t('toast.completedTxHash', { hash: transactionHash }),
          alertType: 'success',
        });
        store.commit('general/setLoading', false);
        addTxHistories({
          hash: transactionHash,
          type: HistoryTxType.Transfer,
          address: fromAddress,
        });
        finalizeCallback();
      })
      .catch((error: any) => {
        console.error(error);
        store.commit('general/setLoading', false);
        store.dispatch('general/showAlertMsg', {
          msg: error.message,
          alertType: 'error',
        });
      });
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

    const decimals = Number(selectedToken.value.metadata.decimals);
    const amount = ethers.utils.parseUnits(String(transferAmt), decimals).toString();

    const callH160Transfer = async (): Promise<void> => {
      const web3 = new Web3(ethProvider.value as any);
      const gasPrice = await getEvmGas(web3, selectedGas.value.price);
      if (isTransferNativeToken.value) {
        await callH160NativeTransfer({
          fromAddress: currentAccount.value,
          toAddress: toAddress,
          transferAmt,
          gasPrice,
          web3,
          finalizeCallback,
        });
      } else {
        await callErc20Transfer({
          fromAddress: currentAccount.value,
          toAddress: toAddress,
          transferAmt: amount,
          contractAddress: selectedToken.value.mappedERC20Addr,
          gasPrice,
          web3,
          finalizeCallback,
        });
      }
    };

    const callSs58Transfer = async (): Promise<void> => {
      if (isTransferNativeToken.value) {
        const transaction = $api!.tx.balances.transferKeepAlive(receivingAddress, amount);
        await signAndSend({
          transaction,
          senderAddress: currentAccount.value,
          substrateAccounts: substrateAccounts.value,
          isCustomSignature: isEthWallet.value,
          txResHandler,
          handleCustomExtrinsic,
          dispatch: store.dispatch,
          tip: selectedTip.value.price,
          txType: HistoryTxType.Transfer,
        });
      } else {
        const transaction = $api!.tx.assets.transfer(
          new BN(selectedToken.value.id),
          receivingAddress,
          amount
        );
        await signAndSend({
          transaction,
          senderAddress: currentAccount.value,
          substrateAccounts: substrateAccounts.value,
          isCustomSignature: false,
          txResHandler,
          handleCustomExtrinsic,
          dispatch: store.dispatch,
          tip: selectedTip.value.price,
          txType: HistoryTxType.Transfer,
        });
      }
    };

    try {
      if (isH160.value) {
        await callH160Transfer();
      } else {
        await callSs58Transfer();
      }
    } catch (e: any) {
      console.error(e);
      store.dispatch('general/showAlertMsg', {
        msg: e.message || 'Something went wrong during asset transfer.',
        alertType: 'error',
      });
      store.commit('general/setLoading', false);
    }
  };

  const getNativeTokenBalance = async (address: string): Promise<number> => {
    const web3Ref = $web3.value;
    const apiRef = $api;
    if (!apiRef || !address || !web3Ref) return 0;
    if (isValidAddressPolkadotAddress(address)) {
      const { data } = await apiRef.query.system.account(address);
      return Number(ethers.utils.formatEther(data.free.toString()));
    }
    if (ethers.utils.isAddress(address)) {
      const balance = await web3Ref.eth.getBalance(address);
      return Number(ethers.utils.formatEther(balance));
    }
    return 0;
  };

  const setToAddressBalance = async (): Promise<void> => {
    if (!isValidDestAddress.value) {
      toAddressBalance.value = 0;
      return;
    }

    const isSendToH160 = isValidEvmAddress(toAddress.value);
    const destAddress = isSendToH160 ? toSS58Address(toAddress.value) : toAddress.value;
    const srcChainId = evmNetworkIdx.value;

    if (isTransferNativeToken.value) {
      toAddressBalance.value = await getNativeTokenBalance(destAddress);
    } else if (isH160.value) {
      const address = isRequiredCheckXvm.value ? buildEvmAddress(toAddress.value) : toAddress.value;
      const balance = await getTokenBal({
        srcChainId,
        address,
        tokenAddress: selectedToken.value.mappedERC20Addr,
        tokenSymbol: selectedToken.value.metadata.symbol,
      });
      toAddressBalance.value = Number(balance);
    } else {
      const { userBalance } = await fetchXcmBalance({
        token: selectedToken.value,
        userAddress: destAddress,
        api: $api!,
      });
      toAddressBalance.value = Number(userBalance);
    }
  };

  const setEvmGasCost = async (): Promise<void> => {
    if (!selectedGas.value || !isH160.value) return;
    try {
      const isErc20 = !isTransferNativeToken.value;
      const transferAmtRef = transferAmt.value || '0';
      const value = isErc20 ? '0x0' : transferAmtRef;
      const destination = ethers.utils.isAddress(toAddress.value)
        ? toAddress.value
        : sampleEvmWalletAddress;

      const destAddress = isErc20 ? selectedToken.value.mappedERC20Addr : destination;
      const contract = isErc20
        ? new $web3.value!.eth.Contract(ABI as AbiItem[], selectedToken.value.mappedERC20Addr)
        : undefined;

      const encodedData = isErc20
        ? contract!.methods
            .transfer(
              destination,
              ethers.utils.parseUnits(transferAmtRef, selectedToken.value.metadata.decimals)
            )
            .encodeABI()
        : undefined;

      evmGasCost.value = await getEvmGasCost({
        isNativeToken: !isErc20,
        evmGasPrice: evmGasPrice.value,
        fromAddress: currentAccount.value,
        toAddress: destAddress,
        web3: $web3.value!,
        value,
        encodedData,
      });
    } catch (error) {
      console.error(error);
    }
  };

  watchEffect(setErrorMsg);
  watchEffect(setToAddressBalance);
  watchEffect(setEvmGasCost);
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
    isTransferNativeToken,
    selectedGas,
    evmGasCost,
    isRequiredCheck,
    isRequiredCheckXvm,
    isCheckedXvm,
    setSelectedGas,
    setSelectedTip,
    inputHandler,
    resetStates,
    toMaxAmount,
    transferAsset,
  };
}
