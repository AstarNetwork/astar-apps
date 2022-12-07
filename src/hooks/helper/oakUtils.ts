import { rpc } from '@imstar15/types';
import { ApiPromise, WsProvider } from '@polkadot/api';

export const getAPI = async (endpoint: string) => {
  const api = await ApiPromise.create({ provider: new WsProvider(endpoint), rpc });

  await api.isReady;

  return api;
};
