import { BatchTxs } from './index';
import { getAddressEnum } from './../../store/dapp-staking/calculation';
import { Struct, Option } from '@polkadot/types';
import { ApiPromise } from '@polkadot/api';

interface ContractEraStake extends Struct {
  readonly contractRewardClaimed: boolean;
  readonly numberOfStakers: string;
  readonly total: string;
}

export interface StakersInfo extends Struct {
  // Todo: fix type annotation
  readonly stakes: any[];
}

const getStakerInfo = async ({
  dappAddress,
  api,
  senderAddress,
  currentEra,
}: {
  dappAddress: string;
  senderAddress: string;
  api: ApiPromise;
  currentEra: number;
}): Promise<{ firstEraToClaimForStaker: number; numberOfUnclaimedEra: number } | null> => {
  const data = await api.query.dappsStaking.stakersInfo<StakersInfo>(
    senderAddress,
    getAddressEnum(dappAddress)
  );
  if (data && !data.isEmpty) {
    const stakes = data.stakes;
    const firstEraToClaimForStaker = Number(stakes[0].toHuman().era);
    const numberOfUnclaimedEra = currentEra - firstEraToClaimForStaker;

    return { firstEraToClaimForStaker, numberOfUnclaimedEra };
  } else {
    return null;
  }
};

const getContractEraStake = async ({
  dappAddress,
  api,
  era,
}: {
  dappAddress: string;
  api: ApiPromise;
  era: number;
}): Promise<Option<ContractEraStake>> => {
  return await api.query.dappsStaking.contractEraStake<Option<ContractEraStake>>(
    getAddressEnum(dappAddress),
    era
  );
};

const eraSkippedZeroStake = async ({
  dappAddress,
  api,
  currentEra,
  era,
}: {
  dappAddress: string;
  api: ApiPromise;
  currentEra: number;
  era: number;
}): Promise<number | false> => {
  // Memo: helper function for finding the next era after dApp has been unstaked all the amount (total: 0)
  const findStakedEra = async (era: number): Promise<number | false> => {
    let result: boolean | number = false;
    for (let e = era + 1; e < currentEra; e++) {
      const data = await getContractEraStake({ dappAddress, era: e, api });
      if (!data.isNone) {
        const { total } = data.unwrapOrDefault().toHuman();
        if (total !== '0') {
          result = e;
          break;
        }
      }
    }
    return result;
  };

  const data = await getContractEraStake({ dappAddress, era, api });
  if (data.isNone) {
    return era;
  } else {
    const { total } = data.unwrapOrDefault().toHuman();
    if (total !== '0') {
      return era;
    } else {
      // Memo: no one staked on this era
      // Memo: find the next era that any user has staked. Return false in case no result
      const result = await findStakedEra(era);
      return result;
    }
  }
};

const getTxsForClaimDapp = async ({
  dappAddress,
  api,
  currentEra,
}: {
  dappAddress: string;
  api: ApiPromise;
  currentEra: number;
}): Promise<BatchTxs> => {
  const eras = []; // used for debugging
  const transactions = [];
  const lastEraClaimedForDapp = await getLastEraClaimedForDapp({
    dappAddress,
    api,
    currentEra,
  });

  // Fixme: This is not an elegant solution. Please feel free to refactor the code.
  // Memo: This function has covered in case dApp has been unstaked totally (total: 0) in some points of the past era (this is a rare case)
  // Ref: https://gyazo.com/e36c0ec019a08b9ab4a93c8d5f119cce

  for (let era = lastEraClaimedForDapp + 1; era < currentEra; era++) {
    const e = await eraSkippedZeroStake({ dappAddress, api, currentEra, era });

    // Memo: No more new staking after the dApp has been unstaked totally
    // When: User claims after dApp has been unstaked
    if (!e) break;

    if (era === e) {
      const tx = api.tx.dappsStaking.claimDapp(getAddressEnum(dappAddress), era);
      transactions.push(tx);
      eras.push(era);
    } else {
      // Memo: e -> skip to the era that has been staked after unstaked
      const tx = api.tx.dappsStaking.claimDapp(getAddressEnum(dappAddress), e);
      transactions.push(tx);
      eras.push(e);
      era = e;
    }
  }

  return transactions;
};

const getTxsForClaimStaker = async ({
  dappAddress,
  api,
  currentEra,
  firstEraToClaimForStaker,
}: {
  dappAddress: string;
  api: ApiPromise;
  currentEra: number;
  firstEraToClaimForStaker: number;
}): Promise<BatchTxs> => {
  const transactions = [];
  for (let era = firstEraToClaimForStaker; era < currentEra; era++) {
    const tx = api.tx.dappsStaking.claimStaker(getAddressEnum(dappAddress));
    transactions.push(tx);
  }

  return transactions;
};

const getFirstEraDappHasNotClaimed = async ({
  dappAddress,
  api,
  currentEra,
}: {
  dappAddress: string;
  api: ApiPromise;
  currentEra: number;
}): Promise<number> => {
  let isFinish = false;
  let era = 0;
  let firstEraDappHasNotClaimed = 0;

  while (!isFinish) {
    try {
      const data = await getContractEraStake({ dappAddress, era, api });
      if (data && !data.isNone) {
        const { contractRewardClaimed } = data.unwrapOrDefault().toHuman();
        if (!contractRewardClaimed) {
          firstEraDappHasNotClaimed = era;
          isFinish = true;
        }
      }

      if (era === currentEra) {
        firstEraDappHasNotClaimed = era;
        isFinish = true;
      }
      era++;
    } catch (error: any) {
      console.error(error.message);
      isFinish = true;
    }
  }
  return firstEraDappHasNotClaimed;
};

const getLastEraClaimedForDapp = async ({
  dappAddress,
  api,
  currentEra,
}: {
  dappAddress: string;
  api: ApiPromise;
  currentEra: number;
}): Promise<number> => {
  let era = currentEra;
  let lastEraClaimed = 0;
  let isFinish = false;

  // Memo: find the last era of 'contractRewardClaimed: false' (decrease from currentEra)
  while (!isFinish) {
    try {
      const data = await getContractEraStake({ dappAddress, era, api });
      if (data && !data.isNone) {
        const { contractRewardClaimed } = data.unwrapOrDefault().toHuman();
        if (contractRewardClaimed) {
          lastEraClaimed = era;
          isFinish = true;
        }
      }

      // Memo: first time claiming `claimDapp`
      if (era === 0) {
        const firstEraDappStaked = await getFirstEraDappHasNotClaimed({
          dappAddress,
          api,
          currentEra,
        });
        lastEraClaimed = firstEraDappStaked - 1;
        isFinish = true;
      }

      era--;
    } catch (error: any) {
      console.error(error.message);
      isFinish = true;
    }
  }
  return lastEraClaimed;
};

export const getIndividualClaimData = async ({
  dappAddress,
  senderAddress,
  api,
  currentEra,
}: {
  dappAddress: string;
  senderAddress: string;
  api: ApiPromise;
  currentEra: number;
}): Promise<{ transactions: BatchTxs; numberOfUnclaimedEra: number }> => {
  const stakerInfo = await getStakerInfo({
    dappAddress,
    api,
    senderAddress,
    currentEra,
  });
  if (!stakerInfo) {
    return { transactions: [], numberOfUnclaimedEra: 0 };
  }

  const results = await Promise.all([
    getTxsForClaimStaker({
      dappAddress,
      api,
      currentEra,
      firstEraToClaimForStaker: stakerInfo.firstEraToClaimForStaker,
    }),
    getTxsForClaimDapp({
      dappAddress,
      api,
      currentEra,
    }),
  ]);

  const txsForClaimStaker = results[0];
  const txsForClaimDapp = results[1];
  const transactions = txsForClaimStaker.concat(txsForClaimDapp);
  return { transactions, numberOfUnclaimedEra: stakerInfo.numberOfUnclaimedEra };
};
