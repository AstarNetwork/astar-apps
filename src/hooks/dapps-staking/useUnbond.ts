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
  const { currentAccount } = useAccount();
  const unbondingPeriod = computed(() => store.getters['dapps/getUnbondingPeriod']);
  const selectedAccountAddress = computed(() => store.getters['general/selectedAddress']);
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
  const { t } = useI18n();

  const handleUnbound = async (contractAddress: string, amount: string | null): Promise<void> => {
    if (amount) {
      const unbondAmount = new BN(ethers.utils.parseEther(amount).toString());
      const dappStakingService = container.get<IDappStakingService>(
        isH160.value ? Symbols.EvmDappStakingService : Symbols.DappStakingService
      );
      const successMessage = t('dappStaking.toast.successfullyUnbond', {
        contractAddress: getShortenAddress(contractAddress, 5),
      });
      await dappStakingService.unbondAndUnstake(
        contractAddress,
        currentAccount.value,
        unbondAmount,
        successMessage
      );

      const ledger = await dappStakingService.getLedger(selectedAccountAddress.value);
      store.commit('dapps/setUnlockingChunks', ledger.unbondingInfo.unlockingChunks);
    }
  };

  return {
    unbondingPeriod,
    handleUnbound,
  };
}
