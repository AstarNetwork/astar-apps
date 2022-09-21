import { ApiPromise } from '@polkadot/api';
import { Struct } from '@polkadot/types';
import { Perbill } from '@polkadot/types/interfaces';
import { aprToApy } from 'apr-tools';
import { $api } from 'boot/api';
import { ethers } from 'ethers';
import { defaultAmountWithDecimals } from 'src/hooks/helper/plasmUtils';
import { useStore } from 'src/store';
import { computed, ref, watchEffect } from 'vue';
import { useChainMetadata, useCurrentEra, useNetworkInfo } from 'src/hooks';
import { TvlModel } from 'src/v2/models';

interface RewardDistributionConfig extends Struct {
  readonly baseTreasuryPercent: Perbill;
  readonly baseStakerPercent: Perbill;
  readonly dappsPercent: Perbill;
  readonly collatorsPercent: Perbill;
  readonly adjustablePercent: Perbill;
  readonly idealDappsStakingTvl: Perbill;
}

export const useApr = () => {
  const store = useStore();
  const { decimal } = useChainMetadata();
  const tvl = computed<TvlModel>(() => store.getters['dapps/getTvl']);
  const { blockPerEra } = useCurrentEra();
  const { currentNetworkIdx } = useNetworkInfo();

  const dapps = computed(() => store.getters['dapps/getAllDapps']);
  const stakerApr = ref<number>(0);
  const stakerApy = ref<number>(0);

  // Memo: get the 7 days average for blocks per minutes
  const getAveBlocksPerMins = async ({
    latestBlock,
    tsNow,
    api,
    blockPerEra,
  }: {
    latestBlock: number;
    tsNow: number;
    blockPerEra: number;
    api: ApiPromise;
  }): Promise<number> => {
    const block7Eras = blockPerEra * 7;
    const block7EraAgo = latestBlock - block7Eras;
    const hashBlock7ErasAgo = await api.rpc.chain.getBlockHash(block7EraAgo);
    const block = await api.at(hashBlock7ErasAgo);
    const tsBlockTimeAgo = await block.query.timestamp.now();
    const spentSecs = (tsNow - tsBlockTimeAgo.toNumber()) / 1000;
    const min = 60;
    return min / (spentSecs / (latestBlock - block7EraAgo));
  };

  const fetchRewardsDistributionConfig = async (
    api: ApiPromise
  ): Promise<{
    baseStakerPercent: number;
    adjustablePercent: number;
    idealDappsStakingTvl: number;
  }> => {
    const result =
      await api.query.blockReward.rewardDistributionConfigStorage<RewardDistributionConfig>();
    const numAdjToPercentage = 0.000000001;
    const baseStakerPercent = result.baseStakerPercent.toNumber() * numAdjToPercentage;
    const adjustablePercent = result.adjustablePercent.toNumber() * numAdjToPercentage;
    const idealDappsStakingTvl = result.idealDappsStakingTvl.toNumber() * numAdjToPercentage;
    return { baseStakerPercent, adjustablePercent, idealDappsStakingTvl };
  };

  watchEffect(async () => {
    const dappsRef = dapps.value;
    const tvlTokenRef = tvl.value;
    const decimalRef = decimal.value;
    const blocksPerEraRef = Number(blockPerEra.value);
    const apiRef = $api;
    if (
      !apiRef ||
      !dappsRef ||
      !tvlTokenRef ||
      !decimalRef ||
      !blocksPerEraRef ||
      !currentNetworkIdx
    ) {
      return;
    }

    // Todo: fetch from token-api
    const getApr = async (): Promise<number> => {
      try {
        const results = await Promise.all([
          apiRef.consts.blockReward.rewardAmount.toString(),
          apiRef.query.timestamp.now(),
          apiRef.rpc.chain.getHeader(),
          fetchRewardsDistributionConfig(apiRef),
          apiRef.query.balances.totalIssuance(),
        ]);

        const rawBlockRewards = results[0];
        const blockRewards = Number(defaultAmountWithDecimals(rawBlockRewards, decimalRef));
        const eraRewards = blocksPerEraRef * blockRewards;
        const latestBlock = results[2].toJSON().number as number;
        const avrBlockPerMins = await getAveBlocksPerMins({
          tsNow: results[1].toNumber(),
          latestBlock,
          api: apiRef,
          blockPerEra: blocksPerEraRef,
        });

        const avgBlocksPerDay = avrBlockPerMins * 60 * 24;
        const dailyEraRate = avgBlocksPerDay / blocksPerEraRef;
        const annualRewards = eraRewards * dailyEraRate * 365.25;
        const totalStaked = Number(
          ethers.utils.formatUnits(tvlTokenRef.tvl.toString(), decimalRef)
        );

        const { baseStakerPercent, adjustablePercent, idealDappsStakingTvl } = results[3];
        const totalIssuance = Number(ethers.utils.formatUnits(results[4].toString(), decimalRef));
        const tvlPercentage = totalStaked / totalIssuance;
        const adjustableStakerPercentage =
          Math.min(1, tvlPercentage / idealDappsStakingTvl) * adjustablePercent;
        const stakerBlockReward = adjustableStakerPercentage + baseStakerPercent;
        const stakerApr = (annualRewards / totalStaked) * stakerBlockReward * 100;

        if (stakerApr === Infinity) return 0;
        return stakerApr;
      } catch (error) {
        console.error(error);
        return 0;
      }
    };

    stakerApr.value = await getApr();
    stakerApy.value = aprToApy(stakerApr.value);
  });
  return {
    stakerApr,
    stakerApy,
  };
};
