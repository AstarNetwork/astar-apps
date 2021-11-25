import { useStore } from 'src/store';
import { computed, ref, watchEffect } from 'vue';
import { useChainMetadata, useCurrentEra, useTvl } from '.';
import { defaultAmountWithDecimals, reduceBalanceToDenom } from './helper/plasmUtils';
import { useApi } from './useApi';

// Ref: https://github.com/PlasmNetwork/Astar/blob/5b01ef3c2ca608126601c1bd04270ed08ece69c4/runtime/shiden/src/lib.rs#L435
// Memo: 50% of block rewards goes to dappsStaking, 50% goes to block validator
// Fixme: ideally get the value from API
const DAPPS_REWARD_RATE = 0.5;

const TS_FIRST_BLOCK = {
  shiden: 1625570880, //  Ref: 2021-07-06 11:28:00 https://shiden.subscan.io/block/1
  shibuya: 1630937640, // Ref: 2021-09-06 14:14:00 https://shibuya.subscan.io/block/1
};

export const useApr = () => {
  const store = useStore();
  const { api } = useApi();
  const { decimal } = useChainMetadata();
  const { tvlToken } = useTvl(api);
  const { blockPerEra } = useCurrentEra();

  const dapps = computed(() => store.getters['dapps/getAllDapps']);
  const stakerApr = ref<number>(0);

  const getAveBlocksPerMins = ({
    chainName,
    latestBlock,
    timestampMillis,
  }: {
    chainName: string;
    latestBlock: number;
    timestampMillis: number;
  }): number => {
    if (chainName === 'shiden' || chainName === 'shibuya') {
      const currentTs = Math.floor(timestampMillis / 1000);
      const minsChainRunning = (currentTs - TS_FIRST_BLOCK[chainName]) / 60;
      const avgBlocksPerMin = latestBlock / minsChainRunning;
      return avgBlocksPerMin;
    }
    return 0;
  };

  watchEffect(() => {
    const apiRef = api && api.value;
    const dappsRef = dapps.value;
    const tvlTokenRef = tvlToken.value;
    const decimalRef = decimal.value;
    const blocksPerEraRef = Number(blockPerEra.value);

    if (!apiRef || !dappsRef || !tvlTokenRef || !decimalRef || !blocksPerEraRef) {
      return;
    }

    const getApr = async (): Promise<number> => {
      try {
        const results = await Promise.all([
          apiRef.consts.blockReward.rewardAmount.toString(),
          apiRef.runtimeVersion.specName.toString(),
          apiRef.query.timestamp.now(),
          apiRef.rpc.chain.getHeader(),
          apiRef.consts.dappsStaking.developerRewardPercentage.toHuman(),
        ]);

        const rawBlockRewards = results[0];
        const blockRewards = Number(defaultAmountWithDecimals(rawBlockRewards, decimalRef));
        const eraRewards = blocksPerEraRef * blockRewards;
        const latestBlock = results[3].toJSON().number as number;
        const avrBlockPerMins = getAveBlocksPerMins({
          chainName: results[1],
          timestampMillis: results[2].toNumber(),
          latestBlock,
        });

        const avgBlocksPerDay = avrBlockPerMins * 60 * 24;
        const dailyEraRate = avgBlocksPerDay / blocksPerEraRef;
        const annualRewards = eraRewards * dailyEraRate * 365.25;
        const totalStaked = Number(reduceBalanceToDenom(tvlTokenRef, decimalRef));

        const developerRewardPercentage = Number(results[4]?.toString().replace('%', '')) * 0.01;
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
    });
  });
  return {
    stakerApr,
  };
};
