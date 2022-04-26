import { options } from '@astar-network/astar-api';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts } from '@polkadot/extension-dapp';
import type { InjectedExtension } from '@polkadot/extension-inject/types';
import { keyring } from '@polkadot/ui-keyring';
import { isTestChain } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { providerEndpoints } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { objToArray } from 'src/hooks/helper/common';
import { getInjectedExtensions } from 'src/hooks/helper/wallet';

interface InjectedAccountExt {
  address: string;
  meta: {
    name: string;
    source: string;
    whenCreated: number;
  };
}

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

  const isDevelopment = isTestChain(systemChain ? systemChain.toString() : '<unknown>');

  keyring.loadAll(
    {
      genesisHash: api.genesisHash,
      isDevelopment,
      ss58Format: 5,
    },
    injectedAccounts
  );
};

const fallBackConnection = async (networkIdx: number): Promise<void> => {
  await Promise.race([
    providerEndpoints[networkIdx].endpoints.map(async (it) => {
      try {
        const provider = new WsProvider(it.endpoint);
        const api = new ApiPromise(options({ provider }));
        await api.isReady;
        const result = await api.rpc.system.health();
        const isHealthy = result.toHuman().shouldHavePeers;
        if (isHealthy) {
          localStorage.setItem(
            LOCAL_STORAGE.SELECTED_ENDPOINT,
            JSON.stringify({
              [networkIdx]: it.endpoint,
            })
          );
          return window.location.reload();
        }
      } catch (error) {
        console.error(error);
      }
    }),
  ]);
};

export async function connectApi(endpoint: string, networkIdx: number, store: any) {
  const provider = new WsProvider(endpoint);
  const api = new ApiPromise(options({ provider }));

  store.commit('general/setCurrentNetworkStatus', 'connecting');
  api.on('error', (error: Error) => console.error(error.message));

  try {
    const apiConnect = new Promise((resolve) => {
      api.isReadyOrError.then(() => {
        resolve('Connected API');
      });
    });

    const resTimeout = 'timeout';
    let timeout = new Promise((resolve) => {
      const timeout = 3 * 1000;
      setTimeout(() => {
        resolve(resTimeout);
      }, timeout);
    });

    const race = Promise.race([apiConnect, timeout]);
    race.then((res) => {
      if (res === resTimeout) {
        fallBackConnection(networkIdx);
      }
    });
  } catch (e) {
    console.error(e);
    fallBackConnection(networkIdx);
  }

  const injectedPromise = await getInjectedExtensions();

  // load the web3 extension
  let extensions: InjectedExtension[] = [];
  try {
    extensions = await injectedPromise;
  } catch (e) {
    console.error(e);
  }

  try {
    await api.isReady;
    await loadAccounts(api);

    keyring.accounts.subject.subscribe((accounts) => {
      if (accounts) {
        const accountArray = objToArray(accounts);
        const accountMap = accountArray.map((account) => {
          const { address, meta } = account.json;
          return {
            address,
            name: meta.name.replace('\n              ', ''),
            source: meta.source,
          };
        });

        store.commit('general/setSubstrateAccounts', accountMap);
      }
    });

    store.commit('general/setCurrentNetworkStatus', 'connected');
  } catch (err) {
    console.error(err);
    store.commit('general/setCurrentNetworkStatus', 'offline');
  }

  return {
    api,
    extensions,
  };
}
