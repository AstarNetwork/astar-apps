import { ContractPromise } from '@polkadot/api-contract';
import { ISubmittableResult } from '@polkadot/types/types';
import { $api } from 'boot/api';
import { ethers } from 'ethers';
import ABI_WASM_ERC20 from 'src/config/abi/WASM-ERC20.json';
import ABI_WASM_PSP22 from 'src/config/abi/WASM-PSP22.json';
import { buildEvmAddress, getTokenBal, isValidEvmAddress } from 'src/config/web3';
import { useCustomSignature, useGasPrice, useNetworkInfo } from 'src/hooks';
import {
  ASTAR_SS58_FORMAT,
  isValidAddressPolkadotAddress,
  SUBSTRATE_SS58_FORMAT,
} from 'src/hooks/helper/plasmUtils';
import { signAndSend } from 'src/hooks/helper/wallet';
import { useAccount } from 'src/hooks/useAccount';
import { XvmAsset } from 'src/modules/token';
import { Path } from 'src/router';
import { useStore } from 'src/store';
import { SubstrateAccount } from 'src/store/general/state';
import { computed, ref, Ref, watch, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';

type ContractType = 'wasm-erc20' | 'wasm-psp22';
const WASM_GAS_LIMIT = 500000000000;
// const WASM_GAS_LIMIT = 5000000000000;
// const WASM_GAS_LIMIT = 300000;
// const WASM_GAS_LIMIT = 500000;
// const WASM_GAS_LIMIT = 50000;
// const WASM_GAS_LIMIT = '500000000000';
// const WASM_GAS_LIMIT = 5242880;
// const WASM_GAS_LIMIT = '3194304';
// const WASM_GAS_LIMIT = 3670016;

const PROOF_SIZE = 3194304;

export function useXvmTokenTransfer(selectedToken: Ref<XvmAsset>) {
  const transferAmt = ref<string | null>(null);
  const toAddressBalance = ref<number>(0);
  const toAddress = ref<string>('');
  const errMsg = ref<string>('');
  const isChecked = ref<boolean>(false);
  const xvmContract = ref<ContractType>('wasm-erc20');

  const store = useStore();
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

    const txResHandler = async (result: ISubmittableResult): Promise<boolean> => {
      const res = await handleResult(result);
      finalizeCallback();
      return res;
    };

    const decimals = Number(selectedToken.value.decimal);
    const amount = ethers.utils.parseUnits(String(transferAmt), decimals).toString();

    const callTransfer = async (): Promise<void> => {
      const isWasmErc20 = xvmContract.value === 'wasm-erc20';
      const contractJson = isWasmErc20 ? ABI_WASM_ERC20 : ABI_WASM_PSP22;

      const contractAddress = isWasmErc20
        ? selectedToken.value.xvmErc20Contract
        : selectedToken.value.xvmPsp22Contract;

      const contract = new ContractPromise($api!, contractJson, contractAddress);

      const gasLimit = contract.registry.createType('WeightV2', {
        proofSize: PROOF_SIZE,
        refTime: WASM_GAS_LIMIT,
      });

      const transaction = isWasmErc20
        ? contract.tx.transfer({ gasLimit }, toAddress, amount)
        : contract.tx.transfer({ gasLimit, storageDepositLimit: null }, toAddress, amount, []);

      // Memo:  SS58 account has to have native token on the mapped H160 address due to gas payment
      await signAndSend({
        transaction,
        senderAddress: currentAccount.value,
        substrateAccounts: substrateAccounts.value,
        isCustomSignature: isEthWallet.value,
        txResHandler,
        handleCustomExtrinsic,
        dispatch: store.dispatch,
        tip: selectedTip.value.price,
      });
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
