import { Struct } from '@polkadot/types';
import { Perbill } from '@polkadot/types/interfaces';
import { aprToApy } from 'apr-tools';
import { $api, $isEnableIndividualClaim } from 'boot/api';
import { ethers } from 'ethers';
import { endpointKey, getProviderIndex } from 'src/config/chainEndpoints';
import { useStore } from 'src/store';
import { computed, ref, watchEffect } from 'vue';
import { useChainMetadata, useCurrentEra, useTvl } from '.';
import { defaultAmountWithDecimals } from './helper/plasmUtils';

interface RewardDistributionConfig extends Struct {
  readonly baseTreasuryPercent: Perbill;
  readonly baseStakerPercent: Perbill;
  readonly dappsPercent: Perbill;
  readonly collatorsPercent: Perbill;
  readonly adjustablePercent: Perbill;
  readonly idealDappsStakingTvl: Perbill;
}

// Ref: https://github.com/PlasmNetwork/Astar/blob/5b01ef3c2ca608126601c1bd04270ed08ece69c4/runtime/shiden/src/lib.rs#L435
// Memo: 50% of block rewards goes to dappsStaking, 50% goes to block validator
// Fixme: ideally get the value from API
const DAPPS_REWARD_RATE = 0.5;

const TS_FIRST_BLOCK = {
  [endpointKey.ASTAR]: 1639798585, //  Ref: 2021-12-18 03:36:25 https://astar.subscan.io/block/1
  [endpointKey.SHIDEN]: 1625570880, //  Ref: 2021-07-06 11:28:00 https://shiden.subscan.io/block/1
  [endpointKey.SHIBUYA]: 1630937640, // Ref: 2021-09-06 14:14:00 https://shibuya.subscan.io/block/1
};

export const useApr = () => {
  const store = useStore();
  const { decimal } = useChainMetadata();
  const { tvlToken } = useTvl($api);
  const { blockPerEra } = useCurrentEra();
  const currentNetworkIdx = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });

  const dapps = computed(() => store.getters['dapps/getAllDapps']);
  const stakerApr = ref<number>(0);
  const stakerApy = ref<number>(0);

  const getAveBlocksPerMins = ({
    chainId,
    latestBlock,
    timestampMillis,
  }: {
    chainId: endpointKey.SHIBUYA | endpointKey.ASTAR | endpointKey.SHIDEN;
    latestBlock: number;
    timestampMillis: number;
  }): number => {
    const currentTs = Math.floor(timestampMillis / 1000);
    const minsChainRunning = (currentTs - TS_FIRST_BLOCK[chainId]) / 60;
    const avgBlocksPerMin = latestBlock / minsChainRunning;
    return avgBlocksPerMin;
  };

  watchEffect(() => {
    const dappsRef = dapps.value;
    const tvlTokenRef = tvlToken.value;
    const decimalRef = decimal.value;
    const blocksPerEraRef = Number(blockPerEra.value);
    const apiRef = $api && $api.value;
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
      const isEnableIndividualClaimRef = $isEnableIndividualClaim.value;
      try {
        const getDeveloperPercentage = async () => {
          if (isEnableIndividualClaimRef) {
            const result =
              await apiRef.query.blockReward.rewardDistributionConfigStorage<RewardDistributionConfig>();
            const percentage = Number(result.dappsPercent.toHuman().replace('%', '')) * 0.01;
            return percentage;
          } else {
            const result = apiRef.consts.dappsStaking.developerRewardPercentage.toHuman();
            const percentage = Number(result && result.toString().replace('%', '')) * 0.01;
            return percentage;
          }
        };

        const results = await Promise.all([
          apiRef.consts.blockReward.rewardAmount.toString(),
          apiRef.query.timestamp.now(),
          apiRef.rpc.chain.getHeader(),
          getDeveloperPercentage(),
        ]);

        const rawBlockRewards = results[0];
        const blockRewards = Number(defaultAmountWithDecimals(rawBlockRewards, decimalRef));
        const eraRewards = blocksPerEraRef * blockRewards;
        const latestBlock = results[2].toJSON().number as number;
        const avrBlockPerMins = getAveBlocksPerMins({
          chainId: currentNetworkIdx.value,
          timestampMillis: results[1].toNumber(),
          latestBlock,
        });

        const avgBlocksPerDay = avrBlockPerMins * 60 * 24;
        const dailyEraRate = avgBlocksPerDay / blocksPerEraRef;
        const annualRewards = eraRewards * dailyEraRate * 365.25;
        const totalStaked = Number(ethers.utils.formatUnits(tvlTokenRef.toString(), decimalRef));
        const developerRewardPercentage = results[3];
        const stakerBlockReward = (1 - developerRewardPercentage) * DAPPS_REWARD_RATE;
        const stakerApr = (annualRewards / totalStaked) * stakerBlockReward * 100;

        if (stakerApr === Infinity) return 0;
        return stakerApr;
      } catch (error) {
        console.error(error);
        return 0;
      }
    };

    apiRef.isReady.then(async () => {
      stakerApr.value = await getApr();
      stakerApy.value = aprToApy(stakerApr.value);
    });
  });
  return {
    stakerApr,
    stakerApy,
  };
};
