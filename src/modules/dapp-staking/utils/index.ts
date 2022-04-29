import { DappItem } from './../../../store/dapp-staking/state';
import { ApiPromise } from '@polkadot/api';
import { GeneralStakerInfo } from 'src/hooks/helper/claim';
import { ContractEvm, StakingData } from './../index';

const getDapps = async (api: ApiPromise): Promise<string[]> => {
  try {
    const dApps = (await api.query.dappsStaking.registeredDapps.entries()).map((it) => {
      const dapp = it[0].toHuman() as ContractEvm[];
      return dapp[0].Evm;
    });
    return dApps;
  } catch (error: any) {
    console.error(error.messages);
    return [];
  }
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
  const dappAddresses = await getDapps(api);
  const data = (
    await Promise.all(
      dappAddresses.map(async (dappHash: string) => {
        const stakerInfo = await api.query.dappsStaking.generalStakerInfo<GeneralStakerInfo>(
          address,
          {
            Evm: dappHash,
          }
        );

        const bnBalance = stakerInfo.stakes.length && stakerInfo.stakes.slice(-1)[0].staked;
        const balance = Number(stakerInfo.stakes.length && bnBalance.toString());

        if (balance > 0) {
          const dapp = dapps.find((it) => it.address.toLowerCase() === dappHash.toLowerCase());
          const name = dapp ? dapp.name : '';
          return { address: dappHash, balance: bnBalance, name };
        }
      })
    )
  ).filter((it) => it !== undefined) as StakingData[];

  return data;
};
