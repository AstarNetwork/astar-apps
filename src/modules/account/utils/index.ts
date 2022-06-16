import { ApiPromise } from '@polkadot/api';
import { SystemAccount } from '../index';

export const fetchNativeBalance = async ({
  api,
  address,
}: {
  api: ApiPromise;
  address: string;
}) => {
  try {
    const accountInfo = await api.query.system.account<SystemAccount>(address);
    const balance = accountInfo.data.free;
    return balance.toString();
  } catch (error) {
    console.error(error);
    return '0';
  }
};
