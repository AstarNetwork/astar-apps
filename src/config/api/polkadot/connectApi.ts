import { ApiPromise, WsProvider } from '@polkadot/api';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { wait } from 'src/hooks/helper/common';
import { ScProvider, WellKnownChain } from '@polkadot/rpc-provider/substrate-connect';
import jsonParachainSpecAstar from './chain-specs/astar.json';
import jsonParachainSpecShiden from './chain-specs/shiden.json';

const RES_INVALID_CONNECTION = 'invalid connection';
const RES_CONNECTED_API = 'connected';
const RES_TIMEOUT = 'timeout';

type Provider = WsProvider | ScProvider;

// Memo: Reach to a healthy node whenever the selected endpoint has failed to connect to API
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
      const resolveApiStatus = new Promise<string>((resolve) => {
        const provider = new WsProvider(it.endpoint);
        const api = new ApiPromise({ provider });
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

      const fallbackTimeout = new Promise<string>(async (resolve) => {
        const timeout = 8 * 1000;
        await wait(timeout);
        resolve(RES_TIMEOUT);
      });

      const race = Promise.race<string>([resolveApiStatus, fallbackTimeout]);
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

// Memo: Connect to node API via selected endpoint
// Memo: Invoke `fallbackConnection` function whenever failed to connect via selected endpoint or timeout
export async function connectApi(
  endpoint: string,
  networkIdx: number,
  store: any
): Promise<{
  api: ApiPromise;
}> {
  // const provider = new WsProvider(endpoint);
  // const api = new ApiPromise({ provider });
  let provider: Provider;
  let api: ApiPromise = new ApiPromise();

  store.commit('general/setCurrentNetworkStatus', 'connecting');

  try {
    if (endpoint.startsWith('light')) {
      const astarSpec = JSON.stringify(jsonParachainSpecAstar);
      // const shidenSpec = JSON.stringify(jsonParachainSpecShiden);

      const relayProvider = new ScProvider(WellKnownChain.polkadot);
      provider = new ScProvider(astarSpec, relayProvider);
      provider.on('error', (error: Error) => console.log('oh shit.....'));
      provider.on('disconnected', (error: Error) => console.log('oh shit disconnected.....'));

      await provider.connect();
    } else {
      provider = new WsProvider(endpoint);
    }

    api = new ApiPromise({ provider });
    api.on('error', (error: Error) => console.error(error.message));

    const apiConnect = new Promise<string>((resolve) => {
      api.isReadyOrError.then(() => {
        resolve(RES_CONNECTED_API);
      });
    });

    const fallbackTimeout = new Promise<string>(async (resolve) => {
      const timeout = endpoint.startsWith('light') ? 100 * 1000 : 8 * 1000;
      await wait(timeout);
      resolve(RES_TIMEOUT);
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

  try {
    await api.isReady;

    store.commit('general/setCurrentNetworkStatus', 'connected');
  } catch (err) {
    console.error(err);
    fallbackConnection({ networkIdx, endpoint });
  }

  return {
    api,
  };
}
