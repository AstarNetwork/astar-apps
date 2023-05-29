import { ASTAR_DECIMALS, getShortenAddress } from '@astar-network/astar-sdk-core';
import { BN } from '@polkadot/util';
import { ethers } from 'ethers';
import { useAccount, useMultisig, useStakingList } from 'src/hooks';
import { balanceFormatter } from 'src/hooks/helper/plasmUtils';
import { Path } from 'src/router';
import { container } from 'src/v2/common';
import { IDappStakingService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { computed, ref, watch } from 'vue';
import { useStore } from 'src/store';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { $api } from 'src/boot/api';

export function useStake() {
  const router = useRouter();
  const route = useRoute();
  const { currentAccount } = useAccount();
  const { stakingList } = useStakingList();
  const { sendMultisigTransaction } = useMultisig();
  const isStakePage = computed<boolean>(() => route.fullPath.includes('stake'));
  const addressTransferFrom = ref<string>(currentAccount.value);
  const { t } = useI18n();
  const store = useStore();
  const multisigAccount = computed<string>(() => route.query.multisig as string);

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
    const balance = new BN(formattedTransferFrom.value.item?.balance || '0');
    if (balance.lt(stakeAmount)) {
      store.dispatch('general/showAlertMsg', {
        msg: t('dappStaking.error.invalidBalance'),
        alertType: 'error',
      });
      return;
    }

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
      });
    } else {
      const successMessage = t('dappStaking.toast.successfullyStaked', {
        contractAddress: getShortenAddress(targetContractId, 5),
      });

      if (multisigAccount.value) {
        const extrinsic = $api!.tx.dappsStaking.bondAndStake(
          { Evm: targetContractId },
          stakeAmount
        );
        await sendMultisigTransaction({
          extrinsic,
          senderAddress: currentAccount.value,
        });
      } else {
        await dappStakingService.stake(
          targetContractId,
          currentAccount.value,
          stakeAmount,
          successMessage
        );
      }
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
