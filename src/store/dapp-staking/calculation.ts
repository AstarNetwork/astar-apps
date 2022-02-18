import { Struct, Vec } from '@polkadot/types';
import { Balance, EraIndex } from '@polkadot/types/interfaces';
import { $api } from 'boot/api';

export const getAddressEnum = (address: string) => ({ Evm: address });

const getClaimableEras = (stakerInfo: StakerInfo): EraStake[] => {
  const result: EraStake[] = [];
  const sortedStakes = stakerInfo.stakes.sort((stake1, stake2) => {
    return stake1.era - stake2.era;
  });

  const firstStake = sortedStakes[0];
  let eraTo = 0;

  if (sortedStakes.length == 1) {
    // calculate until current era
    // TODO get current era
  } else {
    // calculate until next staked era
    eraTo = sortedStakes[1].era;
  }

  for (let era = firstStake.era; era < eraTo; era++) {
    result.push({
      staked: firstStake.staked,
      era,
    } as EraStake);
  }

  return result;
};

export const getIndividualClaimReward = async (
  senderAddress: string,
  contractAddress: string
): Promise<Balance | undefined> => {
  const result = $api.value?.createType('Balance', 0);

  const stakerInfo = await $api.value?.query.dappsStaking.stakersInfo<StakerInfo>(
    senderAddress,
    getAddressEnum(contractAddress)
  );

  if (stakerInfo) {
    const claimableEras = getClaimableEras(stakerInfo);
    for (const claimableEra in claimableEras) {
      // TODO calculate here
    }
    console.log(claimableEras);
  }

  return result;
};

interface EraStake extends Struct {
  staked: Balance;
  era: number;
}

interface StakerInfo extends Struct {
  stakes: EraStake[];
}
