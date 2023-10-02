<template>
  <div v-if="!isLoading" class="wrapper--assets">
    <div class="separator--top container--account">
      <div class="separator" />
    </div>
    <div class="container--assets">
      <astar-button @click="unify()">Unify accounts</astar-button>
      <astar-button @click="setIdentity()">Set setIdentity</astar-button>
      <div class="container--account">
        <div class="title--account">
          <span class="text--xl">
            {{ $t(isH160 ? 'assets.astarEvmAccount' : 'assets.astarNativeAccount') }}
          </span>
        </div>
        <account
          :ttl-erc20-amount="evmAssets.ttlEvmUsdAmount"
          :ttl-native-xcm-usd-amount="ttlNativeXcmUsdAmount"
          :is-loading-erc20-amount="isLoading"
          :is-loading-xcm-assets-amount="isLoadingXcmAssetsAmount"
        />
      </div>
      <div class="row--links">
        <dynamic-links />
      </div>
      <div>
        <div class="container--account">
          <div class="separator" />
        </div>
        <span class="title--assets text--xl">{{ $t('assets.assets') }}</span>
      </div>
      <div class="container--asset-list">
        <div v-if="isH160">
          <evm-asset-list :tokens="evmAssets.assets" />
        </div>
        <div v-else class="container--assets">
          <!-- Memo: hide xvm panel because AA might replace it -->
          <!-- <xvm-native-asset-list v-if="isSupportXvmTransfer" :xvm-assets="xvmAssets.xvmAssets" /> -->
          <xcm-native-asset-list v-if="isEnableXcm" :xcm-assets="xcmAssets.assets" />
        </div>
      </div>
    </div>
    <div class="column--links">
      <dynamic-links />
    </div>
  </div>
</template>
<script lang="ts">
import Account from 'src/components/assets/Account.vue';
import DynamicLinks from 'src/components/assets/DynamicLinks.vue';
import EvmAssetList from 'src/components/assets/EvmAssetList.vue';
import XcmNativeAssetList from 'src/components/assets/XcmNativeAssetList.vue';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { isValidEvmAddress } from '@astar-network/astar-sdk-core';
import { useAccount, useBalance, useDispatchGetDapps, useNetworkInfo } from 'src/hooks';
import { useStore } from 'src/store';
import { EvmAssets, XcmAssets, XvmAssets } from 'src/store/assets/state';
import { Asset, IdentityData } from 'src/v2/models';
import { computed, defineComponent, ref, watch, watchEffect, onUnmounted } from 'vue';
import { container } from 'src/v2/common';
import { IAccountUnificationService, IIdentityService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { INftRepository } from 'src/v2/repositories';

export default defineComponent({
  components: {
    Account,
    DynamicLinks,
    EvmAssetList,
    XcmNativeAssetList,
  },
  setup() {
    const token = ref<Asset | null>(null);
    const isModalXcmBridge = ref<boolean>(false);
    const isModalXcmTransfer = ref<boolean>(false);

    const store = useStore();
    const { currentAccount } = useAccount();
    const { accountData } = useBalance(currentAccount);
    const { isMainnet, currentNetworkIdx, evmNetworkIdx } = useNetworkInfo();
    // Memo: load the dApps data in advance, so that users can access to dApp staging page smoothly
    useDispatchGetDapps();

    const evmNetworkId = computed(() => {
      return Number(providerEndpoints[currentNetworkIdx.value].evmChainId);
    });
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const isShibuya = computed(() => currentNetworkIdx.value === endpointKey.SHIBUYA);

    const xcmAssets = computed<XcmAssets>(() => store.getters['assets/getAllAssets']);
    const xvmAssets = computed<XvmAssets>(() => store.getters['assets/getAllXvmAssets']);
    const ttlNativeXcmUsdAmount = computed<number>(() => xcmAssets.value.ttlNativeXcmUsdAmount);
    const evmAssets = computed<EvmAssets>(() => store.getters['assets/getEvmAllAssets']);

    const isLoadingXcmAssetsAmount = computed<boolean>(() => {
      if (isMainnet.value) {
        return !xcmAssets.value.assets.length;
      } else {
        return false;
      }
    });

    const handleUpdateNativeTokenAssets = () => {
      if (currentAccount.value && evmNetworkIdx.value) {
        store.dispatch('assets/getAssets', { address: currentAccount.value, isFetchUsd: true });
        !isH160.value &&
          store.dispatch('assets/getXvmAssets', {
            currentAccount: currentAccount.value,
            isFetchUsd: isMainnet.value,
            srcChainId: evmNetworkIdx.value,
          });
      }
    };

    const handleUpdateEvmAssets = (): void => {
      currentAccount.value &&
        isValidEvmAddress(currentAccount.value) &&
        store.dispatch('assets/getEvmAssets', {
          currentAccount: currentAccount.value,
          srcChainId: evmNetworkId.value,
          currentNetworkIdx: currentNetworkIdx.value,
          isFetchUsd: isMainnet.value,
        });
      return;
    };

    const handleUpdateXvmAssets = (): void => {
      currentAccount.value &&
        store.dispatch('assets/getXvmAssets', {
          currentAccount: currentAccount.value,
          isFetchUsd: isMainnet.value,
          srcChainId: evmNetworkIdx.value,
        });
      return;
    };

    const getAssetEventAndHandler = (): {
      event: LOCAL_STORAGE;
      handler: () => void;
    } => {
      const event = isH160.value
        ? LOCAL_STORAGE.EVM_TOKEN_IMPORTS
        : LOCAL_STORAGE.XVM_TOKEN_IMPORTS;
      const handler = isH160.value ? handleUpdateEvmAssets : handleUpdateXvmAssets;
      return { event, handler };
    };

    // Memo: triggered after users have imported custom ERC20/XVM tokens
    const handleImportingCustomToken = (): void => {
      const { handler, event } = getAssetEventAndHandler();
      window.addEventListener(event, handler);
    };

    watch([currentAccount, evmNetworkIdx], handleUpdateNativeTokenAssets, { immediate: true });
    watch([currentAccount], handleUpdateEvmAssets, { immediate: isH160.value });
    watchEffect(handleImportingCustomToken);

    const isEnableXcm = computed<boolean>(
      () => xcmAssets.value.assets && xcmAssets.value.assets.length > 0
    );

    const handleEvmAssetLoader = (): void => {
      if (isMainnet.value && isH160.value) {
        const isAssets = evmAssets.value.assets.length > 0;
        store.commit('general/setLoading', !isAssets);
      }
    };

    watch([evmAssets, xcmAssets, isH160, isMainnet], handleEvmAssetLoader, { immediate: true });

    onUnmounted(() => {
      const { handler, event } = getAssetEventAndHandler();
      window.removeEventListener(event, handler);
    });

    // Temp account unification test, TODO remove later
    const unify = async () => {
      const nativeAddress = 'XmSTidw9qbJJdC4ntotpzwCkR7iAgkMUnLv6rg29Qa3aoQa';
      const evmAddress = '0x68F6F226c5D0C8124b62b98Ac797dD6208bAFE90';
      const service = container.get<IAccountUnificationService>(Symbols.AccountUnificationService);
      await service.unifyAccounts(
        nativeAddress,
        evmAddress,
        'Bobo',
        '0x18F6F226c5D0C8124b62b98Ac797dD6208bAFE90',
        '2000'
      );
      console.log('mapped native', await service.getMappedNativeAddress(evmAddress));
      console.log('mapped evm', await service.getMappedEvmAddress(nativeAddress));
    };

    // Temp set identity test, TODO remove later
    const setIdentity = async () => {
      const tokenOwnerAddress = '0xe42A2ADF3BEe1c195f4D72410421ad7908388A6a';
      const nftRepository = container.get<INftRepository>(Symbols.NftRepository);
      const nfts = await nftRepository.getNftMetadata(
        'astar',
        '0x7b2152e51130439374672af463b735a59a47ea85',
        '8893zß'
      );
      console.log(nfts);

      const nativeAddress = 'XmSTidw9qbJJdC4ntotpzwCkR7iAgkMUnLv6rg29Qa3aoQa';
      const service = container.get<IIdentityService>(Symbols.IdentityService);
      await service.setIdentity(
        nativeAddress,
        new IdentityData('aaa', [
          { key: 'ContractAddress', value: '0x18F6F226c5D0C8124b62b98Ac797dD6208bAFE90' },
          { key: 'TokenId', value: '2000' },
        ])
      );
    };

    return {
      evmAssets,
      isLoadingXcmAssetsAmount,
      isH160,
      isEnableXcm,
      xcmAssets,
      xvmAssets,
      ttlNativeXcmUsdAmount,
      isModalXcmTransfer,
      token,
      accountData,
      isModalXcmBridge,
      isLoading,
      unify,
      setIdentity,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/assets.scss';
</style>
