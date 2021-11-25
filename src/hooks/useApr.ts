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
      console.log('latestBlock:', latestBlock); //-> 709,400 blocks
      console.log('minsChainRunning:', minsChainRunning); // -> 201,890.3 mins
      const avgBlocksPerMin = latestBlock / minsChainRunning;
      console.log('avgBlocksPerMin: 709,400 / 201,890.3 =', avgBlocksPerMin); // 3.51 blocks per mins
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
      console.log('getApr: Start ↓');
      try {
        const results = await Promise.all([
          apiRef.query.balances.totalIssuance(),
          apiRef.consts.blockReward.rewardAmount.toString(),
          apiRef.runtimeVersion.specName.toString(),
          apiRef.query.timestamp.now(),
          apiRef.rpc.chain.getHeader(),
          apiRef.consts.dappsStaking.developerRewardPercentage.toHuman(),
        ]);

        const rawTotalSupply = results[0];
        const totalSupply = reduceBalanceToDenom(rawTotalSupply, decimalRef);
        console.log('totalSupply:', totalSupply.toString()); // -> 71,001,295 SDN

        const rawBlockRewards = results[1];
        const blockRewards = Number(defaultAmountWithDecimals(rawBlockRewards, decimalRef));
        console.log('blockRewards:', blockRewards.toString()); // -> 2.664 SDN

        const eraRewards = blocksPerEraRef * blockRewards;
        console.log('eraRewards: 7,200 * 2.664 =', eraRewards); // -> 19,180.8 SDN

        const latestBlock = results[4].toJSON().number as number;

        const avrBlockPerMins = getAveBlocksPerMins({
          chainName: results[2],
          timestampMillis: results[3].toNumber(),
          latestBlock,
        });
        console.log('avrBlockPerMins:', avrBlockPerMins); // -> 3.51 blocks

        const avgBlocksPerDay = avrBlockPerMins * 60 * 24;
        console.log('avgBlocksPerDay:', avgBlocksPerDay); // -> 5,060 blocks

        console.log('blockPerEra:', blocksPerEraRef); // -> 7,200 blocks

        const dailyEraRate = avgBlocksPerDay / blocksPerEraRef;
        console.log('dailyEraRate: 5,060 / 7,200 =', dailyEraRate); // -> 0.702...

        const annualRewards = eraRewards * dailyEraRate * 365.25;
        console.log('annualRewards: 19,180.8 * 0.702 * 365.25 =', annualRewards); // -> 4,923,372 SDN

        const totalStaked = Number(reduceBalanceToDenom(tvlTokenRef, decimalRef));
        console.log('totalStaked:', totalStaked); // -> 7,325,951 SDN

        const developerRewardPercentage = Number(results[5]?.toString().replace('%', '')) * 0.01;
        console.log('developerRewardPercentage:', developerRewardPercentage); // -> 0.8

        const stakerBlockReward = (1 - developerRewardPercentage) * DAPPS_REWARD_RATE;
        console.log('stakerBlockReward: (1 - 0.8) * 0.5 ', stakerBlockReward); // -> 0.1

        const stakerApr = (annualRewards / totalStaked) * stakerBlockReward * 100;
        console.log('stakerApr: 4,923,372 / 7,325,951 * 0.1 * 100 =', stakerApr); // -> 6.7%

        console.log('getApr: Finish ↑');
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
