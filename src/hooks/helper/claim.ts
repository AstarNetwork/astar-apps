import { BatchTxs } from './index';
import { getAddressEnum } from './../../store/dapp-staking/calculation';
import { Struct, Option } from '@polkadot/types';
import { ApiPromise } from '@polkadot/api';

interface ContractEraStake extends Struct {
  readonly contractRewardClaimed: boolean;
  readonly numberOfStakers: string;
  readonly total: string;
}

interface StakersInfo extends Struct {
  stakes: any[];
}

export const getStakerInfo = async ({
  dappAddress,
  api,
  senderAddress,
  currentEra,
}: {
  dappAddress: string;
  senderAddress: string;
  api: ApiPromise;
  currentEra: number;
}) => {
  const data = await api.query.dappsStaking.stakersInfo<StakersInfo>(
    senderAddress,
    getAddressEnum(dappAddress)
  );
  if (data && !data.isEmpty) {
    const stakes = data.stakes;
    const lastEraClaimedForStaker = Number(stakes[0].toHuman().era);
    const numberOfUnclaimedEra = currentEra - lastEraClaimedForStaker;
    return { stakes, lastEraClaimedForStaker, numberOfUnclaimedEra };
  } else {
    false;
  }
};

export const checkIsStakerData = async ({
  dappAddress,
  api,
  senderAddress,
}: {
  dappAddress: string;
  senderAddress: string;
  api: ApiPromise;
}) => {
  const data = await api.query.dappsStaking.stakersInfo<StakersInfo>(
    senderAddress,
    getAddressEnum(dappAddress)
  );
  if (data && !data.isEmpty) {
    return data.stakes.length > 0;
  } else {
    false;
  }
};

export const getClaimStakerData = ({ address, api }: { address: string; api: ApiPromise }) => {
  return api.tx.dappsStaking.claimStaker(getAddressEnum(address));
};

export const getClaimDappData = ({
  address,
  api,
  era,
}: {
  address: string;
  api: ApiPromise;
  era: number;
}) => {
  return api.tx.dappsStaking.claimDapp(getAddressEnum(address), era);
};

export const getLastEraClaimedForDapp = async ({
  dappAddress,
  api,
  currentEra,
}: {
  dappAddress: string;
  api: ApiPromise;
  currentEra: number;
}): Promise<number> => {
  let targetEra = currentEra;
  let lastEraClaimed = 0;
  // Memo: find the last era of 'contractRewardClaimed: false' from current era
  while (lastEraClaimed === 0) {
    const data = await api.query.dappsStaking.contractEraStake<Option<ContractEraStake>>(
      getAddressEnum(dappAddress),
      targetEra
    );
    if (data && !data.isNone) {
      const { contractRewardClaimed } = data.unwrapOrDefault().toHuman();
      if (!contractRewardClaimed) {
        lastEraClaimed = targetEra;
      }
      break;
    }
    if (targetEra === 0) {
      lastEraClaimed = 0;
      break;
    }
    targetEra--;
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
}): Promise<{ transactions: BatchTxs; numberOfUnclaimedEra: number | undefined }> => {
  const transactions: BatchTxs = [];
  const data = await getStakerInfo({
    dappAddress,
    api,
    senderAddress,
    currentEra,
  });

  if (!data) {
    return { transactions, numberOfUnclaimedEra: undefined };
  }

  const { stakes, lastEraClaimedForStaker, numberOfUnclaimedEra } = data;
  if (numberOfUnclaimedEra === 0 || numberOfUnclaimedEra === undefined || stakes.length === 0) {
    return { transactions, numberOfUnclaimedEra: undefined };
  }

  const lastEraClaimedForDapp = await getLastEraClaimedForDapp({
    dappAddress,
    api,
    currentEra,
  });

  for (let era = lastEraClaimedForStaker + 1; era <= currentEra; era++) {
    transactions.push(api.tx.dappsStaking.claimStaker(getAddressEnum(dappAddress)));
    if (era > lastEraClaimedForDapp) {
      transactions.push(api.tx.dappsStaking.claimDapp(getAddressEnum(dappAddress), era));
    }
  }

  console.log('transactions', transactions);
  return { transactions, numberOfUnclaimedEra };
};
