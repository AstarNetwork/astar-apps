import { bool, Option, Struct, u32, Vec } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import BN from 'bn.js';
import { $api } from 'boot/api';
import { ClaimInfo, EraRewardAndStake } from './actions';

export const getAddressEnum = (address: string) => ({ Evm: address });

/**
 * Gets claimable eras from first staked era to next staked era or current era.
 * e.g. if of stakerInfo [EraStake(1000, 5), EraStake(2000, 7), EraStake(500, 15), EraStake(0, 17)]
 * function will return [EraStake(1000, 5), EraStake(1000, 6)]
 * @param stakerInfo Staker info structure
 * @param currentEra Current staking era
 * @returns Claimable eras arrat
 */
const getClaimableEras = async (
  stakerInfo: StakerInfo,
  currentEra: number
): Promise<EraStake[]> => {
  const result: EraStake[] = [];

  // Sort stakerInfo from lowest to highest era.
  const sortedStakes = stakerInfo.stakes.sort((stake1, stake2) => {
    return stake1.era - stake2.era;
  });

  const firstStake = sortedStakes[0];
  let eraTo = 0;

  if (sortedStakes.length == 1) {
    // calculate until current era
    eraTo = currentEra;
  } else {
    // calculate until next staked era
    eraTo = sortedStakes[1].era;
  }

  for (let era = Number(firstStake.era); era < eraTo; era++) {
    result.push({
      staked: firstStake.staked,
      era,
    } as EraStake);
  }

  return result;
};

/**
 * Calculates individual claim reward for staker and contract.
 * @param senderAddress Staker address
 * @param contractAddress Contract address
 * @returns Calculated reward.
 */
export const getIndividualClaimReward = async (
  senderAddress: string,
  contractAddress: string
): Promise<ClaimInfo> => {
  let reward = new BN(0);
  let erasToClaim: number[] = [];

  const stakerInfo = await $api.value?.query.dappsStaking.stakersInfo<StakerInfo>(
    senderAddress,
    getAddressEnum(contractAddress)
  );

  // Developer percentage string has format like 80.00%, get whole part as number.
  const developerRewardPercentage = parseInt(
    ((await $api.value?.query.dappsStaking.developerRewardPercentage) || '0.0')
      .toString()
      .split('.')[0]
  );

  const stakerRewardPercentage = 100 / (100 - developerRewardPercentage);

  if (stakerInfo) {
    const currentEra = Number(await $api.value?.query.dappsStaking.currentEra());
    const claimableEras = await getClaimableEras(stakerInfo, currentEra);

    if (claimableEras.length > 0) {
      // erasToClaim = currentEra - claimableEras[claimableEras.length - 1].era;
      const firstUnclaimedEra = claimableEras[claimableEras.length - 1].era + 1;
      erasToClaim = [...Array(currentEra - firstUnclaimedEra).keys()].map(
        (x) => x + firstUnclaimedEra
      );
      const eraStake = (
        await $api.value?.query.dappsStaking.contractEraStake<
          Option<EraStakingPointsIndividualClaim>
        >(getAddressEnum(contractAddress), claimableEras[0].era)
      )?.unwrapOrDefault();

      if (eraStake) {
        const totalEra = eraStake?.total.toBn() || new BN(0);
        for (const claimableEra of claimableEras) {
          const eraInfo = (
            await $api.value?.query.dappsStaking.eraRewardsAndStakes<Option<EraRewardAndStake>>(
              claimableEra.era
            )
          )?.unwrap();

          if (eraInfo) {
            const eraReward = claimableEra.staked
              .mul(eraInfo.rewards.toBn())
              .div(eraInfo.staked.toBn());
            const stakerJointReward = eraReward.divn(stakerRewardPercentage);
            const stakerReward = stakerJointReward.mul(claimableEra.staked.toBn()).div(totalEra);

            reward = reward.add(stakerReward);
          }
        }
      }
    }
  }

  console.log('reward', reward.toString());
  return {
    rewards: reward,
    estimatedClaimedRewards: new BN(0),
    unclaimedEras: erasToClaim,
  };
};

export const getIndividualClaimStakingInfo = async (
  senderAddress: string,
  contractAddress: string
): Promise<ClaimInfo> => {
  return await getIndividualClaimReward(senderAddress, contractAddress);
};

interface EraStake extends Struct {
  staked: Balance;
  era: number;
}

interface StakerInfo extends Struct {
  stakes: EraStake[];
}

interface EraStakingPointsIndividualClaim extends Struct {
  total: Balance;
  numberOfStakers: u32;
  contractRewardClaimed: bool;
}
