import {
  ChainProvider,
  endpointKey,
  getNetworkName,
  getProviderIndex,
  providerEndpoints,
} from 'src/config/chainEndpoints';
import { Path } from 'src/router/routes';
import { computed, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { checkIsLightClient } from 'src/config/api/polkadot/connectApi';
import { getRandomFromArray, wait } from '@astar-network/astar-sdk-core';
import { ASTAR_CHAIN } from 'src/config/chain';
import { container } from 'src/v2/common';
import { Polkasafe } from 'polkasafe';
import { Symbols } from 'src/v2/symbols';
import { encodeAddress } from '@polkadot/util-crypto';
import { web3Enable } from '@polkadot/extension-dapp';
import { useNetworkInfo } from 'src/hooks/useNetworkInfo';
import { useStore } from 'src/store';
import { useI18n } from 'vue-i18n';
import { useAccount } from './useAccount';
import { SupportWallet } from 'src/config/wallets';

const { NETWORK_IDX, SELECTED_ENDPOINT, SELECTED_ADDRESS, SELECTED_WALLET, MULTISIG } =
  LOCAL_STORAGE;

export function useAppRouter() {
  const router = useRouter();
  const route = useRoute();
  const store = useStore();
  const { t } = useI18n();
  const { disconnectAccount } = useAccount();
  const network = computed<string>(() => route.params.network as string);
  const { currentNetworkIdx } = useNetworkInfo();
  const castNetworkName = (networkParam: string): string => {
    let name = networkParam.toLowerCase();
    if (name === 'shibuya') {
      name = providerEndpoints[endpointKey.SHIBUYA].networkAlias;
    }
    const selectedChain = !!providerEndpoints.find((it) => it.networkAlias === name);
    return selectedChain ? name : '';
  };

  const handleResetAccount = (): void => {
    localStorage.removeItem(SELECTED_ADDRESS);
    localStorage.removeItem(SELECTED_WALLET);
    localStorage.removeItem(MULTISIG);
    window.location.reload();
  };

  // Memo: reload the app if local storage is invalid
  const handleInvalidStorage = (): void => {
    const storedAddress = localStorage.getItem(SELECTED_ADDRESS);
    const storedWallet = localStorage.getItem(SELECTED_WALLET);
    const isWalletConnect = storedWallet === SupportWallet.WalletConnect;
    const invalidCondition =
      (storedAddress && !storedWallet) || (!isWalletConnect && storedWallet && !storedAddress);

    if (invalidCondition) {
      handleResetAccount();
    }
  };

  // Memo: this function is invoked whenever users change the `:network` param via browser's address bar
  const handleInputNetworkParam = (): void => {
    const networkIdxStore = localStorage.getItem(NETWORK_IDX);
    if (!network.value) return;

    const chain = providerEndpoints.find(
      (it) => it.networkAlias === network.value
    ) as ChainProvider;
    const selectedChain = chain ? chain : providerEndpoints[0];

    const index = providerEndpoints
      .map((it) => it.networkAlias)
      .indexOf(selectedChain.networkAlias);

    const endpointIdx = String(index);
    const storedNetworkAlias = getNetworkName(Number(networkIdxStore));
    const networkParam = castNetworkName(network.value);

    const getRandomizedEndpoint = (): string => {
      const endpointsWithoutLightClient = selectedChain.endpoints.filter(
        (it) => !checkIsLightClient(it.endpoint)
      );
      return getRandomFromArray(endpointsWithoutLightClient).endpoint;
    };

    const isReload =
      networkIdxStore === null ||
      networkIdxStore === undefined ||
      storedNetworkAlias !== networkParam;
    if (isReload) {
      localStorage.setItem(
        SELECTED_ENDPOINT,
        JSON.stringify({ [endpointIdx]: getRandomizedEndpoint() })
      );
      localStorage.setItem(NETWORK_IDX, endpointIdx);
      if (network.value === networkParam) {
        const networkIdx = networkIdxStore ? Number(networkIdxStore) : endpointKey.ASTAR;
        const isNetworkIdxMatch = networkIdx === getProviderIndex(networkParam as ASTAR_CHAIN);
        // Memo: Avoid loading the portal twice on the first visit
        // Reload when users input the networks on the address bar manually
        !isNetworkIdxMatch && window.location.reload();
      } else {
        const redirectNetwork =
          network.value.toLowerCase() === 'shibuya' ? endpointKey.SHIBUYA : endpointKey.ASTAR;
        router.push('/' + providerEndpoints[redirectNetwork].networkAlias + Path.Assets);
      }
    }
  };

  const initializePolkasafeClient = async (): Promise<void> => {
    // Memo: wait for updating `currentNetworkIdx`
    const delay = 2000;
    await wait(delay);
    const multisigStored = localStorage.getItem(LOCAL_STORAGE.MULTISIG);
    if (!multisigStored) return;
    // Memo: PolkaSafe supports Astar only
    if (currentNetworkIdx.value !== endpointKey.ASTAR) {
      handleResetAccount();
      return;
    }
    const multisig = JSON.parse(multisigStored);
    const client = new Polkasafe();
    const substratePrefix = 42;
    const signatory = encodeAddress(multisig.signatory.address, substratePrefix);
    const extensions = await web3Enable('AstarNetwork/astar-apps');
    const signer = extensions.find((it) => {
      return it.name === multisig.signatory.source;
    });
    try {
      store.dispatch('general/showAlertMsg', {
        msg: t('toast.enablePolkasafe'),
        alertType: 'info',
      });
      await client.connect('astar', signatory, signer as any);
      container.addConstant<Polkasafe>(Symbols.PolkasafeClient, client);
    } catch (error) {
      console.error(error);
      await disconnectAccount();
    }
  };

  watchEffect(handleInputNetworkParam);
  watchEffect(handleInvalidStorage);
  watchEffect(initializePolkasafeClient);
}
