import { LOCAL_STORAGE } from './../config/localStorage';
import { aprToApy } from 'apr-tools';
import { endpointKey } from 'src/config/chainEndpoints';
import { useStore } from 'src/store';
import { computed, ref, watchEffect } from 'vue';
import { useApi, useChainMetadata, useCurrentEra, useTvl } from '.';
import { defaultAmountWithDecimals, reduceBalanceToDenom } from './helper/plasmUtils';

// Ref: https://github.com/PlasmNetwork/Astar/blob/5b01ef3c2ca608126601c1bd04270ed08ece69c4/runtime/shiden/src/lib.rs#L435
// Memo: 50% of block rewards goes to dappsStaking, 50% goes to block validator
// Fixme: ideally get the value from API
const DAPPS_REWARD_RATE = 0.5;

const TS_FIRST_BLOCK = {
  [endpointKey.SHIDEN]: 1625570880, //  Ref: 2021-07-06 11:28:00 https://shiden.subscan.io/block/1
  [endpointKey.SHIBUYA]: 1630937640, // Ref: 2021-09-06 14:14:00 https://shibuya.subscan.io/block/1
};

export const useApr = () => {
  const { api } = useApi();
  const store = useStore();
  const { decimal } = useChainMetadata();
  const { tvlToken } = useTvl(api);
  const { blockPerEra } = useCurrentEra();
  const currentNetworkIdx = Number(localStorage.getItem(LOCAL_STORAGE.NETWORK_IDX));

  const dapps = computed(() => store.getters['dapps/getAllDapps']);
  const stakerApr = ref<number>(0);
  const stakerApy = ref<number>(0);

  const getAveBlocksPerMins = ({
    chainId,
    latestBlock,
    timestampMillis,
  }: {
    chainId: number;
    latestBlock: number;
    timestampMillis: number;
  }): number => {
    if (chainId === endpointKey.SHIDEN || chainId === endpointKey.SHIBUYA) {
      const currentTs = Math.floor(timestampMillis / 1000);
      const minsChainRunning = (currentTs - TS_FIRST_BLOCK[chainId]) / 60;
      const avgBlocksPerMin = latestBlock / minsChainRunning;
      return avgBlocksPerMin;
    }
    return 0;
  };

  watchEffect(() => {
    const dappsRef = dapps.value;
    const tvlTokenRef = tvlToken.value;
    const decimalRef = decimal.value;
    const blocksPerEraRef = Number(blockPerEra.value);
    const apiRef = api && api.value;
    if (!apiRef || !dappsRef || !tvlTokenRef || !decimalRef || !blocksPerEraRef) {
      return;
    }

    const getApr = async (): Promise<number> => {
      try {
        const results = await Promise.all([
          apiRef.consts.blockReward.rewardAmount.toString(),
          apiRef.query.timestamp.now(),
          apiRef.rpc.chain.getHeader(),
          apiRef.consts.dappsStaking.developerRewardPercentage.toHuman(),
        ]);

        const rawBlockRewards = results[0];
        const blockRewards = Number(defaultAmountWithDecimals(rawBlockRewards, decimalRef));
        const eraRewards = blocksPerEraRef * blockRewards;
        const latestBlock = results[2].toJSON().number as number;
        const avrBlockPerMins = getAveBlocksPerMins({
          chainId: currentNetworkIdx,
          timestampMillis: results[1].toNumber(),
          latestBlock,
        });

        const avgBlocksPerDay = avrBlockPerMins * 60 * 24;
        const dailyEraRate = avgBlocksPerDay / blocksPerEraRef;
        const annualRewards = eraRewards * dailyEraRate * 365.25;
        const totalStaked = Number(reduceBalanceToDenom(tvlTokenRef, decimalRef));

        const developerRewardPercentage = Number(results[3]?.toString().replace('%', '')) * 0.01;
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
