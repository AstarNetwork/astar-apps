import { ApiPromise } from '@polkadot/api';
import { bool, Option, Struct, u64 } from '@polkadot/types';
import { EventRecord, Balance, AccountId } from '@polkadot/types/interfaces';
import { BN } from '@polkadot/util';
import { ethers } from 'ethers';
import { ExtrinsicPayload } from 'src/hooks/helper';
import { balanceFormatter } from 'src/hooks/helper/plasmUtils';
import { getDappAddressEnum } from 'src/modules/dapp-staking';

interface ContractEraStake extends Struct {
  readonly contractRewardClaimed: bool;
  readonly numberOfStakers: string;
  readonly total: string;
}

export interface EraStake extends Struct {
  staked: Balance;
  era: number;
}

export interface GeneralStakerInfo extends Struct {
  readonly stakes: EraStake[];
}

export interface RegisteredDapps extends Struct {
  readonly developer: AccountId;
  readonly state: State;
}

export interface State {
  isUnregistered: boolean;
  asUnregistered: {
    // Memo: era of unregistered
    words: number[];
  };
}

export class PayloadWithWeight {
  public isWeightV2: boolean;

  constructor(public payload: ExtrinsicPayload, public weight: BN | WeightV2) {
    this.isWeightV2 = 'proofSize' in weight && 'refTime' in weight;
  }

  public asWeightV1(): BN {
    return this.weight as BN;
  }

  public asWeightV2(): WeightV2 {
    return this.weight as WeightV2;
  }
}

export interface WeightV2 {
  refTime: u64;
  proofSize: u64;
}

export const checkIsDappOwner = async ({
  dappAddress,
  api,
  senderAddress,
}: {
  dappAddress: string;
  senderAddress: string;
  api: ApiPromise;
}): Promise<boolean> => {
  try {
    if (!dappAddress) {
      return false;
    }

    const result = await api.query.dappsStaking.registeredDapps<Option<RegisteredDapps>>(
      getDappAddressEnum(dappAddress)
    );
    const data = result.unwrapOrDefault();
    const owner = data?.developer.toString();
    return owner === senderAddress;
  } catch (error: any) {
    console.error(error.message);
    return false;
  }
};

export const checkIsDappRegistered = async ({
  dappAddress,
  api,
}: {
  dappAddress: string;
  api: ApiPromise;
}): Promise<{ isRegistered: boolean; eraUnregistered: number }> => {
  try {
    const result = await api.query.dappsStaking.registeredDapps<Option<RegisteredDapps>>(
      getDappAddressEnum(dappAddress)
    );
    const data = result.unwrapOrDefault();
    const isRegistered = !data.state.isUnregistered;
    // Memo: 0 for `registered` dapps
    const eraUnregistered = isRegistered ? 0 : data.state.asUnregistered.words[0];

    return {
      isRegistered,
      eraUnregistered,
    };
  } catch (error: any) {
    console.error(error.message);
    return {
      isRegistered: true,
      eraUnregistered: 0,
    };
  }
};

export const getNumberOfUnclaimedEra = async ({
  dappAddress,
  api,
  senderAddress,
  currentEra,
}: {
  dappAddress: string;
  senderAddress: string;
  api: ApiPromise;
  currentEra: number;
}): Promise<{ numberOfUnclaimedEra: number; isRequiredWithdraw: boolean }> => {
  let numberOfUnclaimedEra = 0;
  let isRequiredWithdraw = false;

  if (!dappAddress) {
    return {
      numberOfUnclaimedEra: 0,
      isRequiredWithdraw: false,
    };
  }

  try {
    const data = await api.query.dappsStaking.generalStakerInfo<GeneralStakerInfo>(
      senderAddress,
      getDappAddressEnum(dappAddress)
    );

    if (data && !data.isEmpty) {
      const stakes = data && data.stakes;

      const registeredData = await checkIsDappRegistered({
        dappAddress,
        api,
      });
      const { eraUnregistered, isRegistered } = registeredData;

      for (let i = 0; i < stakes.length; i++) {
        const { era, staked } = stakes[i];
        if (staked.eq(new BN(0))) continue;
        const nextEraData = stakes[i + 1] ?? null;
        const nextEra = nextEraData && nextEraData.era;
        const isLastEra = i === stakes.length - 1;

        if (isRegistered) {
          const eraToClaim = isLastEra ? currentEra - era : nextEra - era;
          numberOfUnclaimedEra += eraToClaim;
        } else {
          const eraToClaim = isLastEra ? eraUnregistered - era : nextEra - era;
          numberOfUnclaimedEra += eraToClaim;
        }
      }
      if (numberOfUnclaimedEra === 0 && !isRegistered) {
        isRequiredWithdraw = true;
      }
    }

    return { numberOfUnclaimedEra, isRequiredWithdraw };
  } catch (error: any) {
    console.error(error.message);
    return { numberOfUnclaimedEra, isRequiredWithdraw };
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
    getDappAddressEnum(dappAddress),
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
        const total = data.unwrapOrDefault()?.total;
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
    const total = data.unwrapOrDefault()?.total;
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
  senderAddress,
}: {
  dappAddress: string;
  api: ApiPromise;
  currentEra: number;
  senderAddress: string;
}): Promise<PayloadWithWeight[]> => {
  // const eras = []; // used for debugging
  const transactions: PayloadWithWeight[] = [];
  const lastEraClaimedForDapp = await getLastEraClaimedForDapp({
    dappAddress,
    api,
    currentEra,
  });

  // Fixme: This is not an elegant solution. Please feel free to refactor the code.
  // Memo: This function has been covered in case dApp has been unstaked totally (total: 0) at some points of the past era (this is a rare case)
  // Ref: https://gyazo.com/e36c0ec019a08b9ab4a93c8d5f119cce

  // Transaction weight should be alwas the same for the certain transaction, TODO check with Dino
  const info = await api.tx.dappsStaking
    .claimDapp(getDappAddressEnum(dappAddress), 1)
    .paymentInfo(senderAddress);

  for (let era = lastEraClaimedForDapp + 1; era < currentEra; era++) {
    const e = await eraSkippedZeroStake({ dappAddress, api, currentEra, era });

    // Memo: No more new staking after the dApp has been unstaked
    // When: User claims after dApp has been unstaked
    if (!e) break;

    if (era === e) {
      const tx = api.tx.dappsStaking.claimDapp(getDappAddressEnum(dappAddress), era);
      transactions.push(new PayloadWithWeight(tx, info.weight));
    } else {
      // Memo: e -> skip to the era that have been staked after unstaked
      const tx = api.tx.dappsStaking.claimDapp(getDappAddressEnum(dappAddress), e);
      transactions.push(new PayloadWithWeight(tx, info.weight));
      era = e;
    }
  }

  return transactions;
};

const getTxsForClaimStaker = async ({
  dappAddress,
  api,
  numberOfUnclaimedEra,
  senderAddress,
}: {
  dappAddress: string;
  api: ApiPromise;
  numberOfUnclaimedEra: number;
  senderAddress: string;
}): Promise<PayloadWithWeight[]> => {
  const transactions: PayloadWithWeight[] = [];
  const [claimInfo, { isRegistered }] = await Promise.all([
    api.tx.dappsStaking.claimStaker(getDappAddressEnum(dappAddress)).paymentInfo(senderAddress),
    checkIsDappRegistered({
      dappAddress,
      api,
    }),
  ]);

  for (let i = 0; i < numberOfUnclaimedEra; i++) {
    const tx = api.tx.dappsStaking.claimStaker(getDappAddressEnum(dappAddress));
    transactions.push(new PayloadWithWeight(tx, claimInfo.weight));
  }

  if (!isRegistered) {
    const tx = api.tx.dappsStaking.withdrawFromUnregistered(getDappAddressEnum(dappAddress));
    const withdrawalInfo = await api.tx.dappsStaking
      .withdrawFromUnregistered(getDappAddressEnum(dappAddress))
      .paymentInfo(senderAddress);
    transactions.push(new PayloadWithWeight(tx, withdrawalInfo.weight));
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
        const contractRewardClaimed = data.unwrapOrDefault().contractRewardClaimed;
        if (!contractRewardClaimed.valueOf()) {
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
        const contractRewardClaimed = data.unwrapOrDefault().contractRewardClaimed;
        if (contractRewardClaimed.valueOf()) {
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
}): Promise<PayloadWithWeight[]> => {
  try {
    let txsForClaimStaker: PayloadWithWeight[] = [];
    let txsForClaimDapp: PayloadWithWeight[] = [];

    if (!dappAddress) {
      return [];
    }

    const [{ numberOfUnclaimedEra, isRequiredWithdraw }, isDappOwner] = await Promise.all([
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

    if (numberOfUnclaimedEra > 0 || isRequiredWithdraw) {
      txsForClaimStaker = await getTxsForClaimStaker({
        dappAddress,
        api,
        numberOfUnclaimedEra,
        senderAddress,
      });
    }

    if (isDappOwner) {
      txsForClaimDapp = await getTxsForClaimDapp({
        dappAddress,
        api,
        currentEra,
        senderAddress,
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
}): { formattedAmount: string; claimedAmount: number } => {
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
  const claimedAmount = Number(ethers.utils.formatEther(totalClaimStaker.toString()).toString());
  const formattedAmount = balanceFormatter(totalClaimStaker);
  return { claimedAmount, formattedAmount };
};
