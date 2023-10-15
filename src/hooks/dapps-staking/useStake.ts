import { ASTAR_DECIMALS, getShortenAddress } from '@astar-network/astar-sdk-core';
import { BN } from '@polkadot/util';
import { ethers } from 'ethers';
import { useAccount, useStakingList } from 'src/hooks';
import { balanceFormatter } from 'src/hooks/helper/plasmUtils';
import { Path } from 'src/router';
import { container } from 'src/v2/common';
import { IDappStakingService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { computed, ref, watch } from 'vue';
import { useStore } from 'src/store';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

export function useStake() {
  const router = useRouter();
  const route = useRoute();
  const { currentAccount, senderSs58Account } = useAccount();
  const { stakingList } = useStakingList();
  const isStakePage = computed<boolean>(() => route.fullPath.includes('stake'));
  const addressTransferFrom = ref<string>(senderSs58Account.value);
  const { t } = useI18n();
  const store = useStore();

  const setAddressTransferFrom = (address: string) => {
    addressTransferFrom.value = address;
  };

  const formattedTransferFrom = computed(() => {
    const defaultData = { text: '', item: null, isNominationTransfer: false };
    try {
      const stakingListRef = stakingList.value;
      if (!stakingListRef) return defaultData;
      const item = stakingListRef.find((it) => it.address === addressTransferFrom.value);
      if (!item) return defaultData;

      const name = item.name === senderSs58Account.value ? 'Transferable Balance' : item.name;
      const isNominationTransfer = item.address !== senderSs58Account.value;
      const formattedText = `${name} (${balanceFormatter(item.balance, ASTAR_DECIMALS)})`;
      return { text: formattedText, item, isNominationTransfer };
    } catch (error) {
      console.error(error);
      return defaultData;
    }
  });

  const handleStake = async ({
    amount,
    targetContractId,
  }: {
    amount: string;
    targetContractId: string;
  }) => {
    const stakeAmount = new BN(ethers.utils.parseEther(amount).toString());
    const dappStakingServiceFactory = container.get<() => IDappStakingService>(
      Symbols.DappStakingServiceFactory
    );
    const dappStakingService = dappStakingServiceFactory();
    const balance = new BN(formattedTransferFrom.value.item?.balance || '0');
    if (balance.lt(stakeAmount)) {
      store.dispatch('general/showAlertMsg', {
        msg: t('dappStaking.error.invalidBalance'),
        alertType: 'error',
      });
      return;
    }

    const failureMessage = t('dappStaking.toast.requiredClaimFirst');

    if (formattedTransferFrom.value.isNominationTransfer) {
      if (!formattedTransferFrom.value.item) return;
      const successMessage = t('dappStaking.toast.successfullyNominationTransfer', {
        targetContractId: getShortenAddress(targetContractId, 5),
        fromContractId: getShortenAddress(formattedTransferFrom.value.item.address, 5),
      });
      await dappStakingService.nominationTransfer({
        fromContractId: formattedTransferFrom.value.item.address,
        targetContractId,
        address: currentAccount.value,
        amount: stakeAmount,
        successMessage,
        failureMessage,
      });
    } else {
      const successMessage = t('dappStaking.toast.successfullyStaked', {
        contractAddress: getShortenAddress(targetContractId, 5),
      });
      await dappStakingService.stake(
        targetContractId,
        currentAccount.value,
        stakeAmount,
        successMessage,
        failureMessage
      );
    }
    isStakePage.value && router.push(Path.DappStaking);
  };

  watch(
    [senderSs58Account],
    () => {
      addressTransferFrom.value = senderSs58Account.value;
    },
    { immediate: true }
  );

  return {
    formattedTransferFrom,
    currentAccount,
    setAddressTransferFrom,
    handleStake,
  };
}
