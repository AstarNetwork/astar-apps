import { ApiPromise } from '@polkadot/api';
import { LOCAL_STORAGE } from 'src/config/localStorage';

export const checkIsLimitedProvider = (): boolean => {
  const limitedProvider = ['onfinality', 'blastapi'];
  const selectedEndpoint = JSON.parse(
    String(localStorage.getItem(LOCAL_STORAGE.SELECTED_ENDPOINT))
  );
  const endpoint = String(Object.values(selectedEndpoint)[0]);
  return limitedProvider.some((it) => endpoint.includes(it));
};

export const checkIsDappStakingV3 = (api: ApiPromise) => {
  return Object.prototype.hasOwnProperty.call(api.query, 'dappStaking');
};
