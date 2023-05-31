import { ApiPromise, WsProvider } from '@polkadot/api';

export const getAPI = async (endpoint: string) => {
  const api = await ApiPromise.create({ provider: new WsProvider(endpoint) }); // TODO: get types from oak

  await api.isReady;

  return api;
};
