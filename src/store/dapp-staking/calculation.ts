import { bool, Option, Struct, u32 } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import BN from 'bn.js';
import { $api } from 'boot/api';
import { ClaimInfo, EraRewardAndStake } from './actions';

export const getAddressEnum = (address: string) => ({ Evm: address });

/**
 * Gets claimable eras from first staked era to next staked era or current era.
 * e.g. if stakerInfo is [EraStake(1000, 5), EraStake(2000, 7), EraStake(500, 9)] and current era is 10
 * function will return [EraStake(1000, 5), EraStake(1000, 6), EraStake(2000, 7), EraStake(2000, 8), EraStake(500, 9)]
 * @param stakerInfo Staker info structure
 * @param currentEra Current staking era
 * @returns Claimable eras arrat
 */
const getClaimableEras = async (
  stakerInfo: StakerInfo,
  currentEra: number
): Promise<EraStake[]> => {
  const result: EraStake[] = [];

  if (!stakerInfo.stakes || stakerInfo.stakes.length == 0) {
    return result;
  }

  // Sort stakerInfo from lowest to highest era.
  const sortedStakes = stakerInfo.stakes.sort((stake1, stake2) => {
    return stake1.era - stake2.era;
  });

  // add current era so we can loop through all stakes
  const lastStake = stakerInfo.stakes[stakerInfo.stakes.length - 1];
  if (Number(lastStake.era) !== currentEra) {
    stakerInfo.stakes.push({
      staked: lastStake.staked, // staked amount not important for this item since it will not be taken into account
      era: currentEra,
    } as EraStake);
  }

  // Biuild result array
  for (let i = 0; i < stakerInfo.stakes.length - 1; i++) {
    let currentStake = stakerInfo.stakes[i];
    for (let era = currentStake.era; era < stakerInfo.stakes[i + 1].era; era++) {
      result.push({
        staked: currentStake.staked,
        era: Number(era),
      } as EraStake);
    }
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

  const stakerInfo = await $api.value?.query.dappsStaking.generalStakerInfo<StakerInfo>(
    senderAddress,
    getAddressEnum(contractAddress)
  );

  // Developer percentage string has format like 80.00%, get whole part as number.
  const developerRewardPercentage = Number(
    ((await $api.value?.consts.dappsStaking.developerRewardPercentage.toHuman()) || '0.0')
      .toString()
      .split('.')[0]
  );

  const stakerRewardPercentage = 100 / (100 - developerRewardPercentage);

  if (stakerInfo) {
    const currentEra = Number(await $api.value?.query.dappsStaking.currentEra());
    const claimableEras = await getClaimableEras(stakerInfo, currentEra);

    if (claimableEras.length > 0) {
      const firstUnclaimedEra = claimableEras[claimableEras.length - 1].era + 1;
      erasToClaim = [...Array(currentEra - firstUnclaimedEra).keys()].map(
        (x) => x + firstUnclaimedEra
      );

      let totalForEra = new BN(0);
      for (const claimableEra of claimableEras) {
        const eraStake = (
          await $api.value?.query.dappsStaking.contractEraStake<
            Option<EraStakingPointsIndividualClaim>
          >(getAddressEnum(contractAddress), claimableEras[0].era)
        )?.unwrapOrDefault();

        if (eraStake) {
          // If era stake doesn't exist use previous eraTotal.
          // Fist claimable era has contract era stake info so totalForEra will be filled with value > 0
          totalForEra = eraStake?.total.toBn() || new BN(0);
        }
        const eraInfo = (
          await $api.value?.query.dappsStaking.eraRewardsAndStakes<Option<EraRewardAndStake>>(
            claimableEra.era
          )
        )?.unwrapOrDefault();

        // Memo: comment out to avoid displaying `claimableEra.staked.mul` error
        // if (eraInfo) {
        //   const eraReward = claimableEra.staked
        //     .mul(eraInfo.rewards.toBn())
        //     .div(eraInfo.staked.toBn());
        //   const stakerJointReward = eraReward.divn(stakerRewardPercentage);
        //   const stakerReward = stakerJointReward.mul(claimableEra.staked.toBn()).div(totalForEra);

        //   reward = reward.add(stakerReward);
        // }
      }
    }
  }

  // console.log('reward', reward.toString());
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
