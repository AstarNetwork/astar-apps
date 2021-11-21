import { BigNumber } from 'bignumber.js';

const ASTAR_BLOCK_TIME = 12;

const getBlocksPerYear = () => new BigNumber((60 / ASTAR_BLOCK_TIME) * 60 * 24 * 365);

// Reference: Console.log for testing stake on 'StakeTechnologies'
// Assumed rewardsPerBlock was shared across the dApps store ( 1.332 SDN / 18 dApps = 0.074SDN)
export const getApr = ({
  rewardsPerBlock,
  tokenPrice,
  dappsStakedAmount,
}: {
  rewardsPerBlock: number;
  tokenPrice: number;
  dappsStakedAmount: number;
}): number => {
  console.log('rewardsPerBlock:', rewardsPerBlock); // -> 0.074 (SDN)
  console.log('tokenPrice:', tokenPrice); // -> 2.75 (USD)
  console.log('dappsStakedAmount:', dappsStakedAmount); // -> 581,179 (SDN)

  const bnRewardsPerBlock = new BigNumber(rewardsPerBlock);
  const bnTokenPrice = new BigNumber(tokenPrice);
  const bnDappsStakedAmount = new BigNumber(dappsStakedAmount);

  const blocksPerYear = getBlocksPerYear();
  console.log('blocksPerYear:', blocksPerYear.toString()); // -> 2,628,000 (blocks)

  const yearlyRewardPerDapps = bnRewardsPerBlock.times(blocksPerYear);
  console.log('yearlyRewardPerDapps:', yearlyRewardPerDapps.toString());
  // -> 0.074 * 2,628,000 = 194,472 (SDN)

  const dappsStakedAmountUsd = bnDappsStakedAmount.times(tokenPrice);
  console.log('dappsStakedAmountUsd:', dappsStakedAmountUsd.toString());
  // -> 581,179 * 2.75 = 1,598,242

  const apr = yearlyRewardPerDapps.times(bnTokenPrice).div(dappsStakedAmountUsd).times(100);
  console.log('apr:', apr.toString());
  // -> 194,472 * 2.75 / 1,598,242 * 100 = 33.46 (%)

  return apr.toNumber() ?? 0;
};
