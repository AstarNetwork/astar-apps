// Provides an information about tokens allocation
// Total supply, circulating supply, locked tokens, treasury tokens, etc....
import { TvlModel } from 'src/v2/models';
import { ref, watchEffect } from 'vue';
import { useTokenCirculation } from './useTokenCirculation';
import { container } from 'src/v2/common';
import { Symbols } from 'src/v2/symbols';
import { useBalance } from './useBalance';
import { ethers } from 'ethers';
import { IDappStakingServiceV2V3 } from 'src/staking-v3';

export function useTokenDistribution() {
  const treasuryAddress = ref<string>('YQnbw3oWxBnCUarnbePrjFcrSgVPP2jqTZYzWcccmN8fXhd');
  const tvlModel = ref<TvlModel>();
  const { formatNumber, totalSupply, currentCirculating } = useTokenCirculation();
  const { balance: treasuryBalance } = useBalance(treasuryAddress);

  const tvl = ref<number>(0);
  const treasury = ref<number>(0);
  const locked = ref<number>(0);
  const other = ref<number>(0);

  const fetchData = async () => {
    const dappService = container.get<IDappStakingServiceV2V3>(Symbols.DappStakingServiceV2V3);
    tvlModel.value = await dappService.getTvl();
  };

  fetchData();

  watchEffect(() => {
    if (tvlModel?.value && treasuryBalance?.value && totalSupply?.value) {
      const tvlUnrounded = tvlModel?.value?.tvlDefaultUnit ?? 0;
      const treasuryUnrounded = Number(ethers.utils.formatEther(treasuryBalance.value.toString()));

      tvl.value = Math.round(tvlUnrounded);
      treasury.value = Math.round(treasuryUnrounded);
      other.value = currentCirculating.value - tvlUnrounded - treasuryUnrounded;
      locked.value = totalSupply.value - currentCirculating.value;
    }
  });

  return {
    tvl,
    formatNumber,
    totalSupply,
    currentCirculating,
    treasury,
    locked,
    other,
  };
}
