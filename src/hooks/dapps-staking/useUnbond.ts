import { computed } from 'vue';
import { BN } from '@polkadot/util';
import { ethers } from 'ethers';
import { useAccount } from 'src/hooks';
import { container } from 'src/v2/common';
import { IDappStakingService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { useStore } from 'src/store';

export function useUnbound() {
  const store = useStore();
  const { currentAccount } = useAccount();
  const unbondingPeriod = computed(() => store.getters['dapps/getUnbondingPeriod']);

  const handleUnbound = async (contractAddress: string, amount: string | null): Promise<void> => {
    if (amount) {
      const unbondAmount = new BN(ethers.utils.parseEther(amount).toString());
      const dappStakingService = container.get<IDappStakingService>(Symbols.DappStakingService);
      await dappStakingService.unbondAndUnstake(
        contractAddress,
        currentAccount.value,
        unbondAmount
      );
    }
  };

  return {
    unbondingPeriod,
    handleUnbound,
  };
}
