import { ASTAR_DECIMALS } from '@astar-network/astar-sdk-core';
import { BN } from '@polkadot/util';
import { ethers } from 'ethers';
import { useAccount, useStakingList } from 'src/hooks';
import { balanceFormatter } from 'src/hooks/helper/plasmUtils';
import { Path } from 'src/router';
import { container } from 'src/v2/common';
import { IDappStakingService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { computed, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

export function useStake() {
  const router = useRouter();
  const route = useRoute();
  const { currentAccount } = useAccount();
  const { stakingList } = useStakingList();
  const isStakePage = computed<boolean>(() => route.fullPath.includes('stake'));
  const addressTransferFrom = ref<string>(currentAccount.value);

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

      const name = item.name === currentAccount.value ? 'Transferable Balance' : item.name;
      const isNominationTransfer = item.address !== currentAccount.value;

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
    const dappStakingService = container.get<IDappStakingService>(Symbols.DappStakingService);
    if (formattedTransferFrom.value.isNominationTransfer) {
      if (!formattedTransferFrom.value.item) return;
      await dappStakingService.nominationTransfer({
        fromContractId: formattedTransferFrom.value.item.address,
        targetContractId,
        address: currentAccount.value,
        amount: stakeAmount,
      });
    } else {
      await dappStakingService.stake(targetContractId, currentAccount.value, stakeAmount);
    }
    isStakePage.value && router.push(Path.DappStaking);
  };

  watch(
    [currentAccount],
    () => {
      addressTransferFrom.value = currentAccount.value;
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
