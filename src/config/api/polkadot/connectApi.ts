import { ApiPromise, WsProvider } from '@polkadot/api';
import { keyring } from '@polkadot/ui-keyring';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { isTestChain } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import * as typeDefs from '@plasm/types';
import { RegistryTypes } from '@polkadot/types/types';
import { endpointKey } from 'src/config/chainEndpoints';
import { useStore } from 'src/store';
import type { InjectedExtension } from '@polkadot/extension-inject/types';

interface InjectedAccountExt {
  address: string;
  meta: {
    name: string;
    source: string;
    whenCreated: number;
  };
}

const injectedPromise = web3Enable('polkadot-js/apps');

const loadAccounts = async (api: ApiPromise) => {
  // wait for the WASM crypto libraries to load first
  await cryptoWaitReady();

  const [systemChain, injectedAccounts] = await Promise.all([
    api.rpc.system.chain() as any,
    web3Accounts().then((accounts): InjectedAccountExt[] =>
      accounts.map(
        ({ address, meta }, whenCreated): InjectedAccountExt => ({
          address,
          meta: {
            ...meta,
            name: `${meta.name} (
              ${meta.source === 'polkadot-js' ? 'extension' : meta.source})`,
            whenCreated,
          },
        })
      )
    ),
  ]);

  const isDevelopment = isTestChain(
    systemChain ? systemChain.toString() : '<unknown>'
  );

  keyring.loadAll(
    {
      genesisHash: api.genesisHash,
      isDevelopment,
      ss58Format: 5,
    },
    injectedAccounts
  );
};

export async function connectApi(endpoint: string, networkIdx: number) {
  const provider = new WsProvider(endpoint);

  let typeDefinitions = null;
  if (networkIdx === endpointKey.SHIDEN) {
    typeDefinitions = typeDefs.plasmCollatorDefinitions as RegistryTypes;
  } else if (networkIdx === endpointKey.PLASM) {
    typeDefinitions = typeDefs.plasmDefinitions as RegistryTypes;
  } else {
    typeDefinitions = typeDefs.dustyDefinitions as RegistryTypes;
  }

  const api = new ApiPromise({
    provider,
    types: {
      ...typeDefinitions,
      LookupSource: 'MultiAddress',
    },
  });

  const store = useStore();

  store.commit('general/setCurrentNetworkStatus', 'connecting');

  try {
    await api.isReadyOrError;
  } catch (err) {
    console.error('err', err);
  }

  try {
    await loadAccounts(api);

    store.commit('general/setCurrentNetworkStatus', 'connected');
  } catch (err) {
    console.error(err);

    store.commit('general/setCurrentNetworkStatus', 'offline');
  }

  // load the web3 extension
  let extensions: InjectedExtension[] = [];

  try {
    extensions = await injectedPromise;
  } catch (e) {
    console.error(e);
  }

  return {
    api,
    extensions,
  };
}
