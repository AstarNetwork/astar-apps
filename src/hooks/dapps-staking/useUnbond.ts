import { computed } from 'vue';
import { BN } from '@polkadot/util';
import { ethers } from 'ethers';
import { useAccount } from 'src/hooks';
import { container } from 'src/v2/common';
import { IDappStakingService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { useStore } from 'src/store';
import { getShortenAddress } from '@astar-network/astar-sdk-core';
import { useI18n } from 'vue-i18n';

export function useUnbound() {
  const store = useStore();
  const { currentAccount, senderSs58Account } = useAccount();
  const unbondingPeriod = computed(() => store.getters['dapps/getUnbondingPeriod']);
  const { t } = useI18n();

  const handleUnbound = async (contractAddress: string, amount: string | null): Promise<void> => {
    if (amount) {
      const unbondAmount = new BN(ethers.utils.parseEther(amount).toString());
      const dappStakingServiceFactory = container.get<() => IDappStakingService>(
        Symbols.DappStakingServiceFactory
      );
      const dappStakingService = dappStakingServiceFactory();
      const successMessage = t('dappStaking.toast.successfullyUnbond', {
        contractAddress: getShortenAddress(contractAddress, 5),
      });
      await dappStakingService.unbondAndUnstake(
        contractAddress,
        currentAccount.value,
        unbondAmount,
        successMessage
      );

      const ledger = await dappStakingService.getLedger(senderSs58Account.value);
      store.commit('dapps/setUnlockingChunks', ledger.unbondingInfo.unlockingChunks.length);
    }
  };

  return {
    unbondingPeriod,
    handleUnbound,
  };
}
