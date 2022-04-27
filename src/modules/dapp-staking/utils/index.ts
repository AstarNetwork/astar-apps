import { ApiPromise } from '@polkadot/api';
import { GeneralStakerInfo } from 'src/hooks/helper/claim';
import { ContractEvm } from './../index';

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

export const getStakingDappAddresses = async ({
  api,
  address,
}: {
  api: ApiPromise;
  address: string;
}): Promise<string[]> => {
  const dApps = await getDapps(api);
  const data = await Promise.all(
    dApps.map(async (hash) => {
      const stakerInfo = await api.query.dappsStaking.generalStakerInfo<GeneralStakerInfo>(
        address,
        {
          Evm: hash,
        }
      );

      const balance = stakerInfo.stakes.length && stakerInfo.stakes.slice(-1)[0].staked.toString();

      if (Number(balance) > 0) {
        return hash;
      }
    })
  );

  const filteredData = data.filter((it) => it !== undefined) as string[];
  return filteredData;
};
