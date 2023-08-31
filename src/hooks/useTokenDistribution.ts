// Provides an information about tokens allocation
// Total supply, circulating supply, locked tokens, treasury tokens, etc....
import { TvlModel } from 'src/v2/models';
import { ref, watch } from 'vue';
import { useTokenCirculation } from './useTokenCirculation';
import { container } from 'src/v2/common';
import { IDappStakingService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { useBalance } from './useBalance';
import { ethers } from 'ethers';

export function useTokenDistribution() {
  const treasuryAddress = ref<string>('YQnbw3oWxBnCUarnbePrjFcrSgVPP2jqTZYzWcccmN8fXhd');
  const tvlModel = ref<TvlModel>();
  const { formatNumber, totalSupply, currentCirculating } = useTokenCirculation();
  const { balance: treasuryBalance } = useBalance(treasuryAddress);

  const tvl = ref<number>(0);
  const treasury = ref<number>(0);
  const unknown = ref<number>(0);

  const fetchData = async () => {
    const dappService = container.get<IDappStakingService>(Symbols.DappStakingService);
    tvlModel.value = await dappService.getTvl();
  };

  fetchData();

  watch([tvlModel, treasuryBalance, totalSupply], () => {
    if (tvlModel?.value && treasuryBalance?.value && totalSupply?.value) {
      tvl.value = Math.round(tvlModel?.value?.tvlDefaultUnit ?? 0);
      treasury.value = Math.round(
        Number(ethers.utils.formatEther(treasuryBalance.value.toString()))
      );
      unknown.value = totalSupply.value - tvl.value - treasury.value;
    }
  });

  return {
    tvl,
    formatNumber,
    totalSupply,
    currentCirculating,
    treasury,
    unknown,
  };
}
