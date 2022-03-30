import { ApiPromise } from '@polkadot/api';
import { Option, Struct } from '@polkadot/types';
import { EventRecord } from '@polkadot/types/interfaces';
import BN from 'bn.js';
import { getAddressEnum } from './../../store/dapp-staking/calculation';
import { ExtrinsicPayload } from './index';
import { balanceFormatter } from './plasmUtils';

interface ContractEraStake extends Struct {
  readonly contractRewardClaimed: boolean;
  readonly numberOfStakers: string;
  readonly total: string;
}

export interface GeneralStakerInfo extends Struct {
  // Todo: fix type annotation
  readonly stakes: any[];
}

export interface RegisteredDapps extends Struct {
  readonly developer: string;
  readonly state: string;
}

const checkIsDappOwner = async ({
  dappAddress,
  api,
  senderAddress,
}: {
  dappAddress: string;
  senderAddress: string;
  api: ApiPromise;
}): Promise<boolean> => {
  try {
    const data = await api.query.dappsStaking.registeredDapps<RegisteredDapps>(
      getAddressEnum(dappAddress)
    );
    const owner = data.toHuman().developer;
    return owner === senderAddress;
  } catch (error: any) {
    console.error(error.message);
    return false;
  }
};

const getNumberOfUnclaimedEra = async ({
  dappAddress,
  api,
  senderAddress,
  currentEra,
}: {
  dappAddress: string;
  senderAddress: string;
  api: ApiPromise;
  currentEra: number;
}): Promise<number> => {
  let numberOfUnclaimedEra = 0;
  try {
    const data = await api.query.dappsStaking.generalStakerInfo<Option<GeneralStakerInfo>>(
      senderAddress,
      getAddressEnum(dappAddress)
    );

    if (data && !data.isEmpty) {
      const stakerInfo: GeneralStakerInfo = data.toHuman() as any;
      const stakes = stakerInfo && stakerInfo.stakes;

      for (let i = 0; i < stakes.length; i++) {
        const { era, staked } = stakes[i];
        if (staked === '0') continue;
        const nextEraData = stakes[i + 1] ?? null;
        const nextEra = nextEraData && nextEraData.era;
        const isLastEra = i === stakes.length - 1;

        const eraToClaim = isLastEra ? currentEra - era : nextEra - era;
        numberOfUnclaimedEra += eraToClaim;
      }
    }
    return numberOfUnclaimedEra;
  } catch (error: any) {
    console.error(error.message);
    return numberOfUnclaimedEra;
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
      // Memo: No one staked on this era
      // Memo: Find the next era that any user has staked. Return false in case no results found.
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
}): Promise<ExtrinsicPayload[]> => {
  // const eras = []; // used for debugging
  const transactions = [];
  const lastEraClaimedForDapp = await getLastEraClaimedForDapp({
    dappAddress,
    api,
    currentEra,
  });

  // Fixme: This is not an elegant solution. Please feel free to refactor the code.
  // Memo: This function has been covered in case dApp has been unstaked totally (total: 0) at some points of the past era (this is a rare case)
  // Ref: https://gyazo.com/e36c0ec019a08b9ab4a93c8d5f119cce

  for (let era = lastEraClaimedForDapp + 1; era < currentEra; era++) {
    const e = await eraSkippedZeroStake({ dappAddress, api, currentEra, era });

    // Memo: No more new staking after the dApp has been unstaked
    // When: User claims after dApp has been unstaked
    if (!e) break;

    if (era === e) {
      const tx = api.tx.dappsStaking.claimDapp(getAddressEnum(dappAddress), era);
      transactions.push(tx);
      // eras.push(era);
    } else {
      // Memo: e -> skip to the era that have been staked after unstaked
      const tx = api.tx.dappsStaking.claimDapp(getAddressEnum(dappAddress), e);
      transactions.push(tx);
      // eras.push(e);
      era = e;
    }
  }

  return transactions;
};

const getTxsForClaimStaker = async ({
  dappAddress,
  api,
  numberOfUnclaimedEra,
}: {
  dappAddress: string;
  api: ApiPromise;
  numberOfUnclaimedEra: number;
}): Promise<ExtrinsicPayload[]> => {
  const transactions = [];
  for (let i = 0; i < numberOfUnclaimedEra; i++) {
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
  let firstEraDappHasNotClaimed = 0;

  for (let era = 0; era <= currentEra; era++) {
    try {
      const data = await getContractEraStake({ dappAddress, era, api });
      if (data && !data.isNone) {
        const { contractRewardClaimed } = data.unwrapOrDefault().toHuman();
        if (!contractRewardClaimed) {
          firstEraDappHasNotClaimed = era;
          break;
        }
      }

      if (era === currentEra) {
        firstEraDappHasNotClaimed = era;
        break;
      }
    } catch (error: any) {
      console.error(error.message);
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
  let lastEraClaimed = 0;

  for (let era = currentEra; era >= 0; era--) {
    try {
      const data = await getContractEraStake({ dappAddress, era, api });
      if (data && !data.isNone) {
        const { contractRewardClaimed } = data.unwrapOrDefault().toHuman();
        if (contractRewardClaimed) {
          lastEraClaimed = era;
          break;
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
        break;
      }
    } catch (error: any) {
      console.error(error.message);
    }
  }

  return lastEraClaimed;
};

export const getIndividualClaimTxs = async ({
  dappAddress,
  senderAddress,
  api,
  currentEra,
}: {
  dappAddress: string;
  senderAddress: string;
  api: ApiPromise;
  currentEra: number;
}): Promise<ExtrinsicPayload[]> => {
  try {
    let txsForClaimStaker: ExtrinsicPayload[] = [];
    let txsForClaimDapp: ExtrinsicPayload[] = [];

    const [numberOfUnclaimedEra, isDappOwner] = await Promise.all([
      getNumberOfUnclaimedEra({
        dappAddress,
        api,
        senderAddress,
        currentEra,
      }),
      checkIsDappOwner({
        dappAddress,
        api,
        senderAddress,
      }),
    ]);

    if (numberOfUnclaimedEra > 0) {
      txsForClaimStaker = await getTxsForClaimStaker({
        dappAddress,
        api,
        numberOfUnclaimedEra,
      });
    }

    if (isDappOwner) {
      txsForClaimDapp = await getTxsForClaimDapp({
        dappAddress,
        api,
        currentEra,
      });
    }

    const transactions = isDappOwner
      ? txsForClaimStaker.concat(txsForClaimDapp)
      : txsForClaimStaker;
    return transactions;
  } catch (error: any) {
    console.error(error.message);
    return [];
  }
};

export const calculateClaimedStaker = ({
  events,
  senderAddress,
}: {
  events: EventRecord[];
  senderAddress: string;
}): string => {
  let totalClaimStaker = new BN(0);
  events.forEach(({ event: { data, method, section } }) => {
    if (section === 'dappsStaking' && method === 'Reward') {
      const d = data.toHuman() as string[];
      const isClaimStakerEvent = d[0] === senderAddress;
      const claimedAmount = d[3];
      if (isClaimStakerEvent) {
        const amount = claimedAmount.replace(/,/g, '');
        totalClaimStaker = totalClaimStaker.add(new BN(amount));
      }
    }
  });
  return balanceFormatter(totalClaimStaker);
};
