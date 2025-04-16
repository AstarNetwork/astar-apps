import { getRandomFromArray, wait } from '@astar-network/astar-sdk-core';
import { web3Enable } from '@polkadot/extension-dapp';
import { encodeAddress } from '@polkadot/util-crypto';
import { checkIsLightClient } from 'src/config/api/polkadot/connectApi';
import { ASTAR_CHAIN } from 'src/config/chain';
import {
  ChainProvider,
  endpointKey,
  getNetworkName,
  getProviderIndex,
  providerEndpoints,
} from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { SupportWallet } from 'src/config/wallets';
import { useNetworkInfo } from 'src/hooks/useNetworkInfo';
import { Path } from 'src/router/routes';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import { Symbols } from 'src/v2/symbols';
import { computed, watchEffect } from 'vue';
import { ComposerTranslation, useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { handleAddDefaultTokens } from './../modules/zk-evm-bridge/l1-bridge/index';
import { useAccount } from './useAccount';
import { checkIsNativeWallet } from './helper/wallet';
import { PolkasafeWrapper } from 'src/types/polkasafe';
import { buildNetworkUrl } from 'src/router/utils';

const { NETWORK_IDX, SELECTED_ENDPOINT, SELECTED_ADDRESS, SELECTED_WALLET, MULTISIG } =
  LOCAL_STORAGE;

export function useAppRouter() {
  const router = useRouter();
  const route = useRoute();
  const store = useStore();
  const { t } = useI18n();
  const { disconnectAccount } = useAccount();
  const network = computed<string>(() => route.params.network as string);
  const { currentNetworkIdx, isZkEvm } = useNetworkInfo();

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
  const handleInvalidStorage = async (): Promise<void> => {
    const storedAddress = localStorage.getItem(SELECTED_ADDRESS);
    const storedWallet = localStorage.getItem(SELECTED_WALLET);
    const isWalletConnect = storedWallet === SupportWallet.WalletConnect;
    const invalidCondition =
      (storedAddress && !storedWallet) || (!isWalletConnect && storedWallet && !storedAddress);

    invalidCondition && handleResetAccount();

    if (isZkEvm.value) {
      const network = providerEndpoints[endpointKey.ASTAR].networkAlias;
      const url = buildNetworkUrl(network);
      await wait(1000);
      window.open(url, '_self');
    }
  };

  const handleCheckWalletType = (): void => {
    const storedWallet = String(localStorage.getItem(SELECTED_WALLET));
    const isNativeWallet = checkIsNativeWallet(storedWallet as SupportWallet);
    const invalidCondition = !!(isZkEvm.value && isNativeWallet && storedWallet);
    invalidCondition && handleResetAccount();
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
    const client = new PolkasafeWrapper();
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
      container.addConstant<PolkasafeWrapper>(Symbols.PolkasafeClient, client);
    } catch (error) {
      console.error(error);
      await disconnectAccount();
    }
  };

  const handleI18Constant = (): void => {
    container.addConstant<ComposerTranslation>(Symbols.I18Translation, t);
  };

  watchEffect(handleInputNetworkParam);
  watchEffect(async () => {
    handleInvalidStorage();
  });
  watchEffect(initializePolkasafeClient);
  watchEffect(handleAddDefaultTokens);
  watchEffect(handleCheckWalletType);
  watchEffect(handleI18Constant);
}
