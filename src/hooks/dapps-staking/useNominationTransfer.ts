import { useGasPrice } from './../useGasPrice';
import { ISubmittableResult } from '@polkadot/types/types';
import { ethers } from 'ethers';
import { getAddressEnum } from 'src/modules/dapp-staking';
import { showError } from 'src/modules/extrinsic';
import { useStore } from 'src/store';
import { computed, ref, watch, watchEffect } from 'vue';
import { useStakingList } from '../index';
import { TxType } from '../custom-signature/message';
import { ASTAR_DECIMALS, balanceFormatter } from '../helper/plasmUtils';
import { signAndSend } from '../helper/wallet';
import { useAccount } from '../useAccount';
import { useCustomSignature } from '../useCustomSignature';
import { useGetMinStaking } from '../useGetMinStaking';
import { $api } from 'src/boot/api';

export function useNominationTransfer() {
  const { currentAccount } = useAccount();
  const { minStaking } = useGetMinStaking();
  const { stakingList } = useStakingList();
  const store = useStore();
  const addressTransferFrom = ref<string>(currentAccount.value);
  const isEnableNominationTransfer = ref<boolean>(false);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const { isCustomSig, handleResult, handleCustomExtrinsic } = useCustomSignature({
    txType: TxType.requiredClaim,
  });
  const { selectedTip, nativeTipPrice, setSelectedTip } = useGasPrice();

  const setIsEnableNominationTransfer = () => {
    try {
      const metadata = $api!.runtimeMetadata;
      const metadataJson = JSON.stringify(metadata.toJSON());
      const result = metadataJson.includes('nomination_transfer');
      isEnableNominationTransfer.value = result;
    } catch (error) {
      console.error(error);
      isEnableNominationTransfer.value = false;
    }
  };

  const setAddressTransferFrom = (address: string) => {
    addressTransferFrom.value = address;
  };

  const nativeTokenSymbol = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    return chainInfo ? chainInfo.tokenSymbol : '';
  });

  const formattedTransferFrom = computed(() => {
    const defaultData = { text: '', item: null, isNominationTransfer: false };
    try {
      const stakingListRef = stakingList.value;
      if (!stakingListRef) return defaultData;
      const item = stakingListRef.find((it) => it.address === addressTransferFrom.value);
      if (!item) return defaultData;

      const name = item.name === currentAccount.value ? 'Transferable Balance' : item.name;
      const isNominationTransfer = item.address !== currentAccount.value;

      const formattedText = `${name} (${balanceFormatter(item.balance, ASTAR_DECIMALS)})`;
      return { text: formattedText, item, isNominationTransfer };
    } catch (error) {
      console.error(error);
      return defaultData;
    }
  });

  const formattedMinStaking = computed(() => {
    return Number(ethers.utils.formatEther(minStaking.value).toString());
  });

  const isDisabledNominationTransfer = ({
    amount,
    stakedAmount,
  }: {
    amount: number;
    stakedAmount: number;
  }): boolean => {
    if (!formattedTransferFrom.value.item) return false;
    const stakeAmount = amount + stakedAmount;
    const isNotEnoughMinAmount = formattedMinStaking.value > stakeAmount;
    const transferFromRef = formattedTransferFrom.value;
    if (!transferFromRef) return isNotEnoughMinAmount;

    const balTransferFrom = Number(
      ethers.utils.formatEther(formattedTransferFrom.value.item.balance.toString())
    );
    const isShortageFromBalance = amount > balTransferFrom;

    const result = isNotEnoughMinAmount || isShortageFromBalance;
    return result;
  };

  const nominationTransfer = async ({
    amount,
    targetContractId,
  }: {
    amount: string;
    targetContractId: string;
  }): Promise<boolean> => {
    try {
      const apiRef = $api!;
      const transferFromRef = formattedTransferFrom.value;
      if (!transferFromRef || !formattedTransferFrom.value.item) return false;

      const value = ethers.utils.parseEther(String(amount)).toString();
      const transaction = apiRef.tx.dappsStaking.nominationTransfer(
        getAddressEnum(formattedTransferFrom.value.item.address),
        value,
        getAddressEnum(targetContractId)
      );

      const txResHandler = async (result: ISubmittableResult): Promise<boolean> => {
        return await handleResult(result);
      };

      await signAndSend({
        transaction,
        senderAddress: currentAccount.value,
        substrateAccounts: substrateAccounts.value,
        isCustomSignature: isCustomSig.value,
        txResHandler,
        handleCustomExtrinsic,
        dispatch: store.dispatch,
        tip: selectedTip.value.price,
      });
      return true;
    } catch (error: any) {
      console.error(error);
      showError(store.dispatch, error.message);
      return false;
    }
  };

  watchEffect(() => {
    setIsEnableNominationTransfer();
  });

  watch(
    [currentAccount],
    () => {
      addressTransferFrom.value = currentAccount.value;
    },
    { immediate: true }
  );

  return {
    formattedTransferFrom,
    addressTransferFrom,
    currentAccount,
    formattedMinStaking,
    nativeTokenSymbol,
    isEnableNominationTransfer,
    setAddressTransferFrom,
    nominationTransfer,
    isDisabledNominationTransfer,
    selectedTip,
    nativeTipPrice,
    setSelectedTip,
  };
}
