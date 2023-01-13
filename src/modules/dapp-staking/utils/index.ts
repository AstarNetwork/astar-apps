import { ApiPromise } from '@polkadot/api';
import { Option } from '@polkadot/types';
import { EraIndex } from '@polkadot/types/interfaces';
import { BN } from '@polkadot/util';
import { LOCAL_STORAGE } from 'src/config/localStorage';

import {
  getDappAddressEnum,
  wait,
  checkIsDappRegistered,
  GeneralStakerInfo,
} from '@astar-network/astar-sdk-core';
import { balanceFormatter } from 'src/hooks/helper/plasmUtils';
import { EraStakingPoints, StakeInfo } from 'src/store/dapp-staking/actions';

export const checkIsLimitedProvider = (): boolean => {
  const limitedProvider = ['onfinality'];
  const selectedEndpoint = JSON.parse(
    String(localStorage.getItem(LOCAL_STORAGE.SELECTED_ENDPOINT))
  );
  const endpoint = String(Object.values(selectedEndpoint)[0]);
  let result = false;
  limitedProvider.forEach((it) => {
    const res = endpoint.includes(it);
    if (res) {
      result = true;
    }
  });
  return result;
};

export const getLatestStakePoint = async (
  api: ApiPromise,
  contract: string
): Promise<EraStakingPoints | undefined> => {
  if (!contract) {
    return undefined;
  }

  const currentEra = await (await api.query.dappsStaking.currentEra<EraIndex>()).toNumber();
  const contractAddress = getDappAddressEnum(contract);
  // iterate from currentEra backwards until you find record for ContractEraStake
  for (let era = currentEra; era > 0; era -= 1) {
    // Memo: wait for avoiding provider limitation
    checkIsLimitedProvider() && (await wait(200));
    const stakeInfoPromise = await api.query.dappsStaking.contractEraStake<
      Option<EraStakingPoints>
    >(contractAddress, era);
    const stakeInfo = stakeInfoPromise.unwrapOr(undefined);
    if (stakeInfo) {
      return stakeInfo;
    }
  }

  return undefined;
};

export const handleGetStakeInfo = async ({
  api,
  dappAddress,
  currentAccount,
}: {
  api: ApiPromise;
  dappAddress: string;
  currentAccount: string;
}): Promise<StakeInfo | undefined> => {
  const initialYourStake = {
    formatted: '',
    denomAmount: new BN('0'),
  };

  const stakeInfo = await getLatestStakePoint(api, dappAddress);
  if (!stakeInfo) return undefined;

  const data = {
    totalStake: balanceFormatter(stakeInfo.total.toString()),
    yourStake: initialYourStake,
    claimedRewards: '0',
    hasStake: false,
    stakersCount: Number(stakeInfo.numberOfStakers.toString()),
    dappAddress,
    isRegistered: true,
  };

  try {
    const [stakerInfo, { isRegistered }] = await Promise.all([
      api.query.dappsStaking.generalStakerInfo<GeneralStakerInfo>(
        currentAccount,
        getDappAddressEnum(dappAddress)
      ),
      checkIsDappRegistered({ dappAddress, api }),
    ]);

    const balance = stakerInfo.stakes.length && stakerInfo.stakes.slice(-1)[0].staked.toString();
    const yourStake = balance
      ? {
          formatted: balanceFormatter(balance),
          denomAmount: new BN(balance.toString()),
        }
      : initialYourStake;

    return {
      ...data,
      hasStake: Number(balance.toString()) > 0,
      yourStake,
      isRegistered,
    };
  } catch (error) {
    return data;
  }
};

export const getStakeInfo = async ({
  api,
  dappAddress,
  currentAccount,
}: {
  api: ApiPromise;
  dappAddress: string;
  currentAccount: string;
}): Promise<StakeInfo | undefined> => {
  try {
    const stakeInfo = new Promise<StakeInfo | undefined>(async (resolve) => {
      const data = await handleGetStakeInfo({ api, dappAddress, currentAccount });
      resolve(data);
    });
    const fallbackTimeout = new Promise<string>(async (resolve) => {
      const timeout = 4 * 1000;
      await wait(timeout);
      resolve('timeout');
    });

    const race = Promise.race<StakeInfo | undefined | string>([stakeInfo, fallbackTimeout]);
    const result = race.then((res) => {
      if (res === 'timeout') {
        return undefined;
      } else {
        return res as StakeInfo;
      }
    });
    return result;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
