import { hasProperty, isValidEvmAddress, toSS58Address, wait } from '@astar-network/astar-sdk-core';
import { endpointKey } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { SupportMultisig, SupportWallet } from 'src/config/wallets';
import { Multisig } from 'src/modules/multisig';
import { useStore } from 'src/store';
import { SubstrateAccount, UnifiedAccount } from 'src/store/general/state';
import { container } from 'src/v2/common';
import { IEventAggregator, UnifyAccountMessage } from 'src/v2/messaging';
import { IdentityRepository } from 'src/v2/repositories/implementations/IdentityRepository';
import { IAccountUnificationService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { computed, ref, watch, watchEffect } from 'vue';
import { useNetworkInfo } from './useNetworkInfo';
import { INftRepository } from 'src/v2/repositories';
import { useNft } from './useNft';
import { NftMetadata } from 'src/v2/models';
import { getWcProvider } from './helper/wallet';
import { useEthProvider } from './custom-signature/useEthProvider';

export const ETHEREUM_EXTENSION = 'Ethereum Extension';

// Memo: Gives some time for syncing
const DELAY = 100;

export const useAccount = () => {
  const store = useStore();
  const { getProxiedUrl } = useNft();
  const { currentNetworkIdx, currentNetworkName } = useNetworkInfo();
  const { ethProvider } = useEthProvider();
  const multisig = ref<Multisig>();

  const isH160Formatted = computed(() => store.getters['general/isH160Formatted']);
  const currentEcdsaAccount = computed(() => store.getters['general/currentEcdsaAccount']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const currentAddress = computed(() => store.getters['general/selectedAddress']);
  const unifiedAccount = computed(() => store.getters['general/getUnifiedAccount']);
  const isLockdropAccount = computed<boolean>(
    () => !isH160Formatted.value && currentAccountName.value === ETHEREUM_EXTENSION
  );

  const isAccountUnification = computed<boolean>(() => {
    return !!(
      (currentNetworkIdx.value === endpointKey.SHIBUYA && currentAccountName) ||
      currentNetworkIdx.value === endpointKey.LOCAL
    );
  });

  // Memo: converts EVM wallet address to SS58 for dApp staking queries
  const senderSs58Account = computed<string>(() => {
    if (isValidEvmAddress(currentAccount.value)) {
      return unifiedAccount.value?.nativeAddress
        ? unifiedAccount.value.nativeAddress
        : toSS58Address(currentAccount.value);
    }

    return currentAccount.value;
  });
  const isMultisig = computed<boolean>(() => !!localStorage.getItem(LOCAL_STORAGE.MULTISIG));
  const { SELECTED_ADDRESS, SELECTED_WALLET, MULTISIG } = LOCAL_STORAGE;

  const disconnectAccount = async (): Promise<Boolean> => {
    return await new Promise(async (resolve) => {
      await wait(DELAY);
      store.commit('general/setCurrentAddress', null);
      store.commit('general/setIsH160Formatted', false);
      store.commit('general/setIsEthWallet', false);
      store.commit('dapps/setClaimedRewardsAmount', 0);
      store.commit('general/setCurrentWallet', '');
      store.commit('general/setCurrentEcdsaAccount', {
        ethereum: '',
        ss58: '',
        h160: '',
      });
      const wallet = String(localStorage.getItem(SELECTED_WALLET));
      if (wallet === SupportWallet.WalletConnect) {
        const wcProvider = getWcProvider();
        if (wcProvider) {
          try {
            await wcProvider.disconnect();
          } catch (error) {
            console.error(error);
          }
          localStorage.removeItem('WCM_VERSION');
          container.unbind(Symbols.WcProvider);
        }
      }
      localStorage.removeItem(SELECTED_ADDRESS);
      localStorage.removeItem(SELECTED_WALLET);
      localStorage.removeItem(MULTISIG);

      currentAccount.value = '';
      currentAccountName.value = '';
      resolve(true);
    });
  };

  const checkIfUnified = async (
    address: string,
    persistState = true
  ): Promise<UnifiedAccount | undefined> => {
    const service = container.get<IAccountUnificationService>(Symbols.AccountUnificationService);

    const isEvmAddress = isValidEvmAddress(address);
    const mapped = isEvmAddress
      ? await service.getMappedNativeAddress(address)
      : await service.getMappedEvmAddress(address);

    if (mapped) {
      const identityRepository = container.get<IdentityRepository>(Symbols.IdentityRepository);
      const nftRepository = container.get<INftRepository>(Symbols.NftRepository);
      const identity = await identityRepository.getIdentity(isEvmAddress ? mapped : address);
      const name = identity?.display || '';

      let avatarUrl: string | undefined;
      let nft: NftMetadata | undefined;

      const avatarContractAddress = identity?.getAvatarContractAddress();
      const avatarTokenId = identity?.getAvatarTokenId();
      if (avatarContractAddress && avatarTokenId) {
        nft = await nftRepository.getNftMetadata(
          currentNetworkName.value.toLowerCase(),
          avatarContractAddress,
          avatarTokenId
        );

        if (nft) {
          avatarUrl = getProxiedUrl(nft.image);
        }
      }

      const account: UnifiedAccount = {
        nativeAddress: isEvmAddress ? mapped : address,
        evmAddress: isEvmAddress ? address : mapped,
        name,
        avatarUrl,
        avatarMetadata: {
          name: nft?.name || '',
          description: nft?.description || '',
          image: avatarUrl || '',
          contractAddress: nft?.contractAddress || '',
          tokenId: nft?.tokenId || '',
          tokenUri: nft?.tokenUri || '',
          ownerAddress: nft?.ownerAddress || '',
        },
      };

      if (persistState) {
        store.commit('general/setUnifiedAccount', account);
      }

      return account;
    } else {
      store.commit('general/setUnifiedAccount', undefined);
    }

    return undefined;
  };

  const showAccountUnificationModal = (): void => {
    const eventAggregator = container.get<IEventAggregator>(Symbols.EventAggregator);
    eventAggregator.publish(new UnifyAccountMessage());
  };

  const currentAccount = ref<string>('');
  const currentAccountName = ref<string>('');

  watch(
    [isH160Formatted, currentEcdsaAccount],
    () => {
      if (currentEcdsaAccount.value.h160 || currentEcdsaAccount.value.ss58) {
        currentAccountName.value = ETHEREUM_EXTENSION;
        localStorage.setItem(SELECTED_ADDRESS, ETHEREUM_EXTENSION);
        store.commit('general/setIsEthWallet', true);

        const { ss58, h160 } = currentEcdsaAccount.value;
        const address = ss58 ? ss58 : h160;
        currentAccount.value = address;
        store.commit('general/setIsH160Formatted', h160 ? true : false);
        store.commit('general/setCurrentAddress', address);
        return;
      }

      currentAccount.value = '';
      currentAccountName.value = '';
    },
    { immediate: true }
  );

  watch(
    [currentAddress, substrateAccounts],
    async () => {
      await wait(DELAY);
      if (
        !substrateAccounts.value ||
        currentAddress.value === null ||
        currentAddress.value === '' ||
        currentEcdsaAccount.value.ethereum
      ) {
        return;
      }
      const account = substrateAccounts.value.find(
        (it: SubstrateAccount) => it.address === currentAddress.value
      );
      if (!account) return;

      currentAccount.value = account.address;
      currentAccountName.value = unifiedAccount.value ? unifiedAccount.value.name : account.name;
      localStorage.setItem(SELECTED_ADDRESS, String(currentAddress.value));
      store.commit('general/setIsEthWallet', false);
      store.commit('general/setIsH160Formatted', false);
      return;
    },
    { immediate: true }
  );

  watch(
    [currentAddress],
    async () => {
      await wait(DELAY);

      if (currentAddress.value) {
        await checkIfUnified(currentAddress.value);
      }

      const storedWallet = localStorage.getItem(LOCAL_STORAGE.SELECTED_WALLET);
      if (storedWallet === SupportMultisig.Polkasafe) {
        currentAccount.value = currentAddress.value;
        multisig.value = JSON.parse(localStorage.getItem(LOCAL_STORAGE.MULTISIG) || '{}');
        currentAccountName.value = multisig.value!.multisigAccount.name;
        localStorage.setItem(SELECTED_ADDRESS, String(currentAddress.value));
      } else {
        multisig.value = undefined;
      }
    },
    { immediate: true }
  );

  watch([unifiedAccount], () => {
    if (unifiedAccount.value) {
      currentAccountName.value = unifiedAccount.value.name;
    }
  });

  return {
    substrateAccounts,
    currentAccount,
    currentAccountName,
    senderSs58Account,
    multisig,
    isMultisig,
    isAccountUnification,
    isH160Formatted,
    isLockdropAccount,
    disconnectAccount,
    showAccountUnificationModal,
    checkIfUnified,
  };
};
