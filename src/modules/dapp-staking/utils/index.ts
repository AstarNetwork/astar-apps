import { ApiPromise } from '@polkadot/api';
import { Option } from '@polkadot/types';
import { EraIndex } from '@polkadot/types/interfaces';
import BN from 'bn.js';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { checkIsDappRegistered, GeneralStakerInfo } from 'src/hooks/helper/claim';
import { wait } from 'src/hooks/helper/common';
import { balanceFormatter } from 'src/hooks/helper/plasmUtils';
import { EraStakingPoints, StakeInfo } from './../../../store/dapp-staking/actions';
import { DappItem } from './../../../store/dapp-staking/state';
import { StakingData } from './../index';

interface StakeData {
  address: string;
  balance: string;
  name: string;
}

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

export const formatStakingList = async ({
  api,
  address,
  dapps,
}: {
  api: ApiPromise;
  address: string;
  dapps: DappItem[];
}): Promise<StakingData[]> => {
  let data = [];

  const getData = async (dapp: DappItem): Promise<StakeData | undefined> => {
    try {
      const stakerInfo = await api.query.dappsStaking.generalStakerInfo<GeneralStakerInfo>(
        address,
        {
          Evm: dapp.address,
        }
      );
      if (!stakerInfo) return undefined;

      const bnBalance = stakerInfo.stakes.length && stakerInfo.stakes.slice(-1)[0].staked;
      const bal = stakerInfo.stakes.length && bnBalance.toString();

      if (Number(bal) > 0) {
        return { address: dapp.address, balance: String(bal), name: dapp.name };
      }
    } catch (error) {
      return undefined;
    }
  };

  if (checkIsLimitedProvider()) {
    for await (let dapp of dapps) {
      const dappData = await getData(dapp);
      data.push(dappData);
    }
  } else {
    data = await Promise.all(
      dapps.map(async (dapp: DappItem) => {
        return await getData(dapp);
      })
    );
  }
  return data.filter((it) => it !== undefined) as StakingData[];
};

export const getDappStakers = async ({ api }: { api: ApiPromise }): Promise<number> => {
  try {
    // Memo: It takes a while to return the promise (10 ~ 15 secs).
    // Memo: We can cache this result and query via Token-API in the future.
    const result = await api.query.dappsStaking.ledger.entries();
    const numStakers = result.length;
    return numStakers;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

// TODO refactor, detect address type, etc.....
export const getAddressEnum = (address: string) => ({ Evm: address });

export const getLatestStakePoint = async (
  api: ApiPromise,
  contract: string
): Promise<EraStakingPoints | undefined> => {
  const currentEra = await (await api.query.dappsStaking.currentEra<EraIndex>()).toNumber();
  const contractAddress = getAddressEnum(contract);
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
      api.query.dappsStaking.generalStakerInfo<GeneralStakerInfo>(currentAccount, {
        Evm: dappAddress,
      }),
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
