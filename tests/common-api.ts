import { ApiPromise, WsProvider } from '@polkadot/api';

export const NODE_ENDPOINT = process.env.ENDPOINT || 'ws://127.0.0.1:57083';
export let chainDecimals = 18;

export const getApi = async (): Promise<ApiPromise> => {
  const provider = new WsProvider(NODE_ENDPOINT);
  const apiPromise = new ApiPromise({ provider });

  const api = await apiPromise.isReady;
  chainDecimals = api.registry.chainDecimals[0];

  return api;
};

export const getBalance = async (address: string): Promise<bigint> => {
  const api = await getApi();
  const balance = await api.query.system.account(address);

  return balance.data.free.toBigInt();
};
