import { ApiPromise, WsProvider, ScProvider } from '@polkadot/api';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { wait } from '@astar-network/astar-sdk-core';
import * as Sc from '@substrate/connect';
import jsonParachainSpecAstar from './chain-specs/astar.json';
import jsonParachainSpecShiden from './chain-specs/shiden.json';
import jsonParachainSpecShibuya from './chain-specs/shibuya.json';
import jsonParachainSpecTokyo from './chain-specs/tokyo.json';
import { WellKnownChain } from '@substrate/connect';

const RES_INVALID_CONNECTION = 'invalid connection';
const RES_CONNECTED_API = 'connected';
const RES_TIMEOUT = 'timeout';

type Provider = WsProvider | ScProvider;

export const checkIsLightClient = (endpoint: string): boolean => endpoint.startsWith('light://');
export const checkIsSubstrateConnectInstalled = (): boolean =>
  !!document.getElementById('substrateConnectExtensionAvailableV2');

const getParachainSpec = (networkIdx: endpointKey): string => {
  switch (networkIdx) {
    case endpointKey.ASTAR:
      return JSON.stringify(jsonParachainSpecAstar);
    case endpointKey.SHIDEN:
      return JSON.stringify(jsonParachainSpecShiden);
    case endpointKey.SHIBUYA:
      return JSON.stringify(jsonParachainSpecShibuya);
    default:
      throw new Error(`networkIdx ${networkIdx} is not supported.`);
  }
};

const getWellKnownChain = (networkIdx: endpointKey): WellKnownChain | string => {
  switch (networkIdx) {
    case endpointKey.ASTAR:
      return WellKnownChain.polkadot;
    case endpointKey.SHIDEN:
      return WellKnownChain.ksmcc3;
    case endpointKey.SHIBUYA:
      return JSON.stringify(jsonParachainSpecTokyo);
    default:
      throw new Error(`networkIdx ${networkIdx} is not supported.`);
  }
};

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
    return it.endpoint !== endpoint && !checkIsLightClient(it.endpoint);
  });
  // if (1 >= filteredEndpoints.length) {
  //   return window.location.reload();
  // }

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
  let provider: Provider;
  let api: ApiPromise = new ApiPromise({ provider: new WsProvider('ws://', false) });

  store.commit('general/setCurrentNetworkStatus', 'connecting');
  store.commit('general/setLoading', true);

  api.on('error', (error: Error) => console.error(error.message));
  try {
    if (checkIsLightClient(endpoint)) {
      const parachainSpec = getParachainSpec(networkIdx);
      const relayProvider = new ScProvider(Sc, getWellKnownChain(networkIdx));
      provider = new ScProvider(Sc, parachainSpec, relayProvider);

      // TODO see how to handle errors and disconnections.
      provider.on('error', (error: Error) => fallbackConnection({ networkIdx, endpoint }));
      provider.on('disconnected', (error: Error) => console.error('handle disconnect'));
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
      // Memo: 3600 -> 60mins
      const timeout = checkIsLightClient(endpoint) ? 3600 * 1000 : 8 * 1000;
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
  } finally {
    store.commit('general/setLoading', false);
  }

  return {
    api,
  };
}
