import {
  capitalize,
  getRandomFromArray,
  hasProperty,
  objToArray,
} from '@astar-network/astar-sdk-core';
import { SubstrateAccount } from 'src/store/general/state';
import { ApiPromise } from '@polkadot/api';
import { keyring } from '@polkadot/ui-keyring';
import { useMeta } from 'quasar';
import { boot } from 'quasar/wrappers';
import { checkIsLightClient, connectApi } from 'src/config/api/polkadot/connectApi';
import { endpointKey, getProviderIndex, providerEndpoints } from 'src/config/chainEndpoints';
import { ASTAR_CHAIN } from 'src/config/chain';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { opengraphMeta } from 'src/config/metadata';
import { createAstarWeb3Instance, TNetworkId } from 'src/config/web3';
import { isMobileDevice } from 'src/hooks/helper/wallet';
import { useChainInfo } from 'src/hooks/useChainInfo';
import { useExtensions } from 'src/hooks/useExtensions';
import { useMetaExtensions } from 'src/hooks/useMetaExtensions';
import { computed, ref, watchPostEffect } from 'vue';
import Web3 from 'web3';
import { SupportWallet, supportWalletObj } from 'src/config/wallets';
import { initiatePolkdatodSnap } from 'src/modules/snap';
import { initPolkadotSnap } from '@astar-network/metamask-astar-adapter';

let $api: ApiPromise | undefined;
const $web3 = ref<Web3>();

export default boot(async ({ store }) => {
  const { NETWORK_IDX, SELECTED_ENDPOINT, SELECTED_ADDRESS, SELECTED_WALLET } = LOCAL_STORAGE;

  const networkIdxStore = localStorage.getItem(NETWORK_IDX);
  const selectedEndpointData = localStorage.getItem(SELECTED_ENDPOINT);
  const networkIdx = computed(() => store.getters['general/networkIdx']);

  const getRandomizedEndpoint = (): string => {
    const endpointsWithoutLightClient = providerEndpoints[networkIdx.value].endpoints.filter(
      (it) => !checkIsLightClient(it.endpoint)
    );
    return getRandomFromArray(endpointsWithoutLightClient).endpoint;
  };
  const defaultEndpoint = getRandomizedEndpoint();

  if (!selectedEndpointData) {
    if (networkIdxStore !== null) {
      const networkIdx = Number(networkIdxStore) || 0;
      localStorage.setItem(
        LOCAL_STORAGE.SELECTED_ENDPOINT,
        JSON.stringify({ [networkIdx]: defaultEndpoint })
      );
    } else {
      localStorage.setItem(
        LOCAL_STORAGE.SELECTED_ENDPOINT,
        JSON.stringify({ '0': defaultEndpoint })
      );
    }
  }
  const selectedAddress = localStorage.getItem(SELECTED_ADDRESS);
  const selectedEndpoint = selectedEndpointData ? JSON.parse(selectedEndpointData) : {};
  if (networkIdxStore) {
    store.commit('general/setCurrentNetworkIdx', Number(networkIdxStore));
  }

  let endpoint = hasProperty(selectedEndpoint, networkIdx.value)
    ? selectedEndpoint[networkIdx.value]
    : defaultEndpoint;
  if (networkIdx.value === endpointKey.CUSTOM) {
    const inputtedEndpoint = JSON.parse(String(selectedEndpointData));
    endpoint = Object.values(inputtedEndpoint)[0] as string;
  }

  if (networkIdx.value === endpointKey.LOCAL) {
    endpoint = providerEndpoints[networkIdx.value].endpoints[0].endpoint;
  }

  // set metadata header
  const favicon = providerEndpoints[Number(networkIdx.value)].defaultLogo;
  const displayName = providerEndpoints[Number(networkIdx.value)].displayName;
  const networkName = capitalize(providerEndpoints[Number(networkIdx.value)].networkAlias);
  useMeta({
    title: '',
    titleTemplate: (title) => `${title} | ${networkName} Portal - ${displayName}`,
    htmlAttr: { lang: 'en' },
    link: {
      material: {
        rel: 'icon',
        href: favicon,
      },
    },
    meta: opengraphMeta(displayName, networkName),
  });
  let { api } = await connectApi(endpoint, networkIdx.value, store);
  $api = api;

  const seen = new Set();
  const accountMap: SubstrateAccount[] = [];
  keyring.accounts.subject.subscribe((accounts) => {
    if (accounts) {
      const accountArray = objToArray(accounts);
      accountArray.forEach((account) => {
        const { address, meta } = account.json;
        const source = meta.source;
        const addressWithSource = address + source;
        const isSeen = seen.has(addressWithSource);

        if (!isSeen) {
          const data = {
            address,
            name: meta.name.replace('\n              ', ''),
            source,
          };

          seen.add(addressWithSource);
          accountMap.push(data);
          store.commit('general/setSubstrateAccounts', accountMap);
        }
      });
    }
  });

  const setWeb3 = async (networkId: TNetworkId): Promise<void> => {
    const web3 = await createAstarWeb3Instance(networkId);
    if (!web3) {
      console.error(`cannot create the web3 instance with network id ${networkId}`);
    }
    $web3.value = web3;
  };

  // update chaininfo
  const { chainInfo } = useChainInfo(api);
  watchPostEffect(async () => {
    store.commit('general/setChainInfo', chainInfo.value);
    const networkIdx = store.getters['general/networkIdx'];
    const isZkEvm = networkIdx === endpointKey.ZKATANA || networkIdx === endpointKey.ASTAR_ZKEVM;

    if (isZkEvm) {
      await setWeb3(networkIdx);
    } else {
      if (chainInfo.value?.chain) {
        const currentChain = chainInfo.value?.chain as ASTAR_CHAIN;
        const currentNetworkIdx = getProviderIndex(currentChain);
        await setWeb3(currentNetworkIdx as TNetworkId);
      }
    }
  });

  // execute extension process automatically if selectedAddress is linked or mobile device
  const wallet = String(localStorage.getItem(SELECTED_WALLET));
  const isSubstrateWallet = hasProperty(supportWalletObj, wallet);

  if (wallet === SupportWallet.Snap) {
    const isSnapInstalled = await initiatePolkdatodSnap();
    isSnapInstalled && (await initPolkadotSnap());
  }

  if (isSubstrateWallet) {
    if (selectedAddress !== null || isMobileDevice) {
      const { extensions } = useExtensions(api, store);
      const { metaExtensions, extensionCount } = useMetaExtensions(api, extensions)!!;
      watchPostEffect(async () => {
        store.commit('general/setMetaExtensions', metaExtensions.value);
        store.commit('general/setExtensionCount', extensionCount.value);
      });
    }
  }
});

export { $api, $web3 };
