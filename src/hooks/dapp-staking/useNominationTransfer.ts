import { useStore } from 'src/store';
import { $api } from 'boot/api';
import { ethers } from 'ethers';
import { StakingData } from 'src/modules/dapp-staking';
import { computed, ref, watchEffect } from 'vue';
import { ASTAR_DECIMALS, balanceFormatter } from '../helper/plasmUtils';
import { useAccount } from '../useAccount';
import { useGetMinStaking } from '../useGetMinStaking';

export function useNominationTransfer({ stakingList }: { stakingList: StakingData[] }) {
  const { currentAccount } = useAccount();
  const { minStaking } = useGetMinStaking($api);
  const store = useStore();
  const addressTransferFrom = ref<string>(currentAccount.value);

  const setAddressTransferFrom = (address: string) => {
    addressTransferFrom.value = address;
  };

  const nativeTokenSymbol = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    return chainInfo ? chainInfo.tokenSymbol : '';
  });

  const formattedTransferFrom = computed(() => {
    const stakingListRef = stakingList;
    const item = stakingListRef.find((it) => it.address === addressTransferFrom.value);
    if (!item) return null;

    const name = item.name === currentAccount.value ? 'Transferable Balance' : item.name;
    const isNominationTransfer = item.address !== currentAccount.value;

    const formattedText = `${name} (${balanceFormatter(item.balance, ASTAR_DECIMALS)})`;
    return { text: formattedText, item, isNominationTransfer };
  });

  // const nominationErrorMsg = computed(()=>{
  //   const transferFromRef = formattedTransferFrom.value;
  //   if (!transferFromRef) return;

  //   const balTransferFrom = Number(
  //     ethers.utils.parseEther(transferFromRef.item.balance.toString())
  //   );
  // })

  const checkIsEnoughAmount = ({ amount }: { amount: number }): boolean => {
    const formattedMinStaking = Number(ethers.utils.formatEther(minStaking.value.toString()));

    if (formattedMinStaking > amount) {
      throw Error(
        `The amount of token to be staking must greater than ${formattedMinStaking} ${nativeTokenSymbol.value}`
      );
    } else {
      return true;
    }
  };

  const nominationTransfer = async ({ amount }: { amount: string }) => {
    try {
      const transferFromRef = formattedTransferFrom.value;
      if (!transferFromRef) return;

      // const balTransferFrom = Number(
      //   ethers.utils.parseEther(transferFromRef.item.balance.toString())
      // );
      checkIsEnoughAmount({ amount: Number(amount) });
    } catch (error: any) {
      console.error(error);
      store.dispatch('general/showAlertMsg', {
        msg: error.message,
        alertType: 'error',
      });
    }
  };

  watchEffect(() => {
    // checkIsEnoughAmount();
  });

  return {
    setAddressTransferFrom,
    formattedTransferFrom,
    addressTransferFrom,
    currentAccount,
    nominationTransfer,
  };
}
