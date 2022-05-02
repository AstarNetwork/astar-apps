import { options } from '@astar-network/astar-api';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts } from '@polkadot/extension-dapp';
import type { InjectedExtension } from '@polkadot/extension-inject/types';
import { keyring } from '@polkadot/ui-keyring';
import { isTestChain } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
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

const RES_INVALID_CONNECTION = 'invalid connection';
const RES_CONNECTED_API = 'connected';
const RES_TIMEOUT = 'timeout';

const loadAccounts = async (api: ApiPromise): Promise<void> => {
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

const fallbackConnection = async ({
  networkIdx,
  endpoint,
}: {
  networkIdx: number;
  endpoint: string;
}): Promise<void> => {
  if (networkIdx === endpointKey.LOCAL || networkIdx === endpointKey.CUSTOM) {
    localStorage.removeItem(LOCAL_STORAGE.SELECTED_ENDPOINT);
    localStorage.removeItem(LOCAL_STORAGE.NETWORK_IDX);
    return window.location.reload();
  }

  const filteredEndpoints = providerEndpoints[networkIdx].endpoints.filter((it) => {
    return it.endpoint !== endpoint;
  });
  if (1 >= filteredEndpoints.length) {
    return window.location.reload();
  }

  for await (let it of filteredEndpoints) {
    try {
      const apiConnect = new Promise<string>((resolve) => {
        const provider = new WsProvider(it.endpoint);
        const api = new ApiPromise(options({ provider }));
        api.isReadyOrError.then(async () => {
          const result = await api.rpc.system.health();
          const isHealthy = result.toHuman().shouldHavePeers;
          if (isHealthy) {
            localStorage.setItem(
              LOCAL_STORAGE.SELECTED_ENDPOINT,
              JSON.stringify({
                [networkIdx]: it.endpoint,
              })
            );
            resolve(RES_CONNECTED_API);
          } else {
            resolve(RES_INVALID_CONNECTION);
          }
        });
      });

      const fallbackTimeout = new Promise<string>((resolve) => {
        const timeout = 8 * 1000;
        setTimeout(() => {
          resolve(RES_TIMEOUT);
        }, timeout);
      });

      const race = Promise.race<string>([apiConnect, fallbackTimeout]);
      race.then((res: string) => {
        if (res === RES_CONNECTED_API) {
          return window.location.reload();
        } else {
          return;
        }
      });
    } catch (error) {
      console.error(error);
      continue;
    }
  }
};

export async function connectApi(
  endpoint: string,
  networkIdx: number,
  store: any
): Promise<{
  api: ApiPromise;
  extensions: InjectedExtension[];
}> {
  const provider = new WsProvider(endpoint);
  const api = new ApiPromise(options({ provider }));

  store.commit('general/setCurrentNetworkStatus', 'connecting');
  api.on('error', (error: Error) => console.error(error.message));

  try {
    const apiConnect = new Promise<string>((resolve) => {
      api.isReadyOrError.then(() => {
        resolve(RES_CONNECTED_API);
      });
    });

    const fallbackTimeout = new Promise<string>((resolve) => {
      const timeout = 8 * 1000;
      setTimeout(() => {
        resolve(RES_TIMEOUT);
      }, timeout);
    });

    const race = Promise.race<string>([apiConnect, fallbackTimeout]);
    race.then((res: string) => {
      if (res === RES_TIMEOUT) {
        fallbackConnection({ networkIdx, endpoint });
      }
    });
  } catch (e) {
    console.error(e);
    fallbackConnection({ networkIdx, endpoint });
  }

  const injectedPromise = await getInjectedExtensions();
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
    fallbackConnection({ networkIdx, endpoint });
  }

  return {
    api,
    extensions,
  };
}
