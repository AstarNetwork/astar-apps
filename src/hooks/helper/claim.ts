import { BatchTxs } from './index';
import { getAddressEnum } from './../../store/dapp-staking/calculation';
import { Struct, Option } from '@polkadot/types';
import { ApiPromise } from '@polkadot/api';

interface ContractEraStake extends Struct {
  readonly contractRewardClaimed: boolean;
  readonly numberOfStakers: string;
  readonly total: string;
}

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

export const handleGetClaimDappData = async ({
  address,
  api,
}: {
  address: string;
  api: ApiPromise;
}): Promise<BatchTxs> => {
  const transactions: BatchTxs = [];

  // Fixme: API query doesn't work for without passing 2nd parameter(era)
  // const data = await $api?.value?.query.dappsStaking.contractEraStake(
  //   getAddressEnum(address),
  //   null
  // );
  // const d = data.entries();
  // console.log('d', d);

  // Memo: This is temporary solution. We have to fix the issue above in the future
  const currentEraBn = await api.query.dappsStaking.currentEra();
  const currentEra = Number(currentEraBn?.toString());
  for (let era = 0; era <= currentEra; era++) {
    const data = await api.query.dappsStaking.contractEraStake<Option<ContractEraStake>>(
      getAddressEnum(address),
      era
    );
    if (data && !data.isNone) {
      const { contractRewardClaimed } = data.unwrapOrDefault().toHuman();
      if (!contractRewardClaimed) {
        const txData = getClaimDappData({ address, era, api });
        txData && transactions.push(txData);
      }
    }
  }
  return transactions;
};
