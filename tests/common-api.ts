import { ApiPromise, WsProvider } from '@polkadot/api';
import { Option } from '@polkadot/types';
import { AccountLedger } from 'src/hooks';
import { ContractStakeInfo } from 'src/v2/repositories/implementations';

export const NODE_ENDPOINT = process.env.ENDPOINT || 'ws://127.0.0.1:57083';
export let chainDecimals = 18;

export const getApi = async (): Promise<ApiPromise> => {
  const provider = new WsProvider(NODE_ENDPOINT);
  const apiPromise = new ApiPromise({ provider });

  const api = await apiPromise.isReady;
  chainDecimals = api.registry.chainDecimals[0];

  return api;
};

export const getAddress = (address: string) => {
  return { Evm: address };
};

export const getBalance = async (address: string): Promise<bigint> => {
  const api = await getApi();
  const balance = await api.query.system.account(address);

  return balance.data.free.toBigInt() - balance.data.feeFrozen.toBigInt();
};

export const getStakedAmount = async (address: string): Promise<bigint> => {
  const api = await getApi();
  const eraStake = await api.query.dappsStaking.contractEraStake<Option<ContractStakeInfo>>(
    getAddress(address),
    1
  );

  return eraStake.isSome ? BigInt(eraStake.unwrap().total.toString()) : BigInt(0);
};

export const getAccountLedger = async (address: string): Promise<AccountLedger> => {
  const api = await getApi();
  const ledger = await api.query.dappsStaking.ledger<AccountLedger>(address);

  return ledger;
};
