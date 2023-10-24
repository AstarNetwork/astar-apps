import { container } from 'src/v2/common';
import { IDappStakingRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import { ref, watchEffect } from 'vue';
import { useNetworkInfo } from './useNetworkInfo';

export const useAprFromApi = () => {
  const stakerApr = ref<number>(0);
  const stakerApy = ref<number>(0);
  const { networkNameSubstrate } = useNetworkInfo();
  const repository = container.get<IDappStakingRepository>(Symbols.DappStakingRepository);

  watchEffect(async () => {
    try {
      if (networkNameSubstrate.value) {
        const result = await repository.getApr(networkNameSubstrate.value);
        stakerApr.value = result.apr;
        stakerApy.value = result.apy;
      }
    } catch (err) {
      stakerApr.value = 0;
      stakerApy.value = 0;
      console.error(err);
    }
  });

  return {
    stakerApr,
    stakerApy,
  };
};
