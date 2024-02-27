<template>
  <div v-if="xcmAssets.assets.length > 0 || !isLoading" class="wrapper--assets">
    <div class="container--assets">
      <div class="column--main">
        <register-banner v-if="isDappStakingV3" />
        <account
          :ttl-erc20-amount="evmAssets.ttlEvmUsdAmount"
          :ttl-native-xcm-usd-amount="ttlNativeXcmUsdAmount"
          :is-loading-erc20-amount="isLoading"
          :is-loading-xcm-assets-amount="isLoadingXcmAssetsAmount"
        />

        <anchor-links
          v-if="isDappStakingV3 && !isZkEvm"
          :native-section="nativeSection"
          :staking-section="stakingSection"
          :project-section="projectSection"
          :assets-section="assetsSection"
          :is-dapp-owner="isDappOwner"
        />

        <template v-if="isH160">
          <div ref="nativeSection">
            <evm-native-token class="container" />
          </div>
          <zk-astr v-if="isZkEvm" class="container" />
        </template>
        <template v-else>
          <div ref="nativeSection">
            <native-asset-list class="container" />
          </div>
        </template>

        <template v-if="isDappStakingV3 && !isZkEvm">
          <div ref="stakingSection">
            <staking />
          </div>
        </template>

        <template v-if="isDappStakingV3 && !isZkEvm && isDappOwner">
          <div ref="projectSection">
            <your-project :own-dapps="ownDapps" />
          </div>
        </template>

        <div v-if="!isLoading" ref="assetsSection">
          <template v-if="isH160">
            <evm-asset-list :tokens="evmAssets.assets" class="container" />
          </template>
          <template v-else>
            <!-- Memo: hide xvm panel because AA might replace it -->
            <!-- <xvm-native-asset-list v-if="isSupportXvmTransfer" :xvm-assets="xvmAssets.xvmAssets" /> -->
            <xcm-native-asset-list
              v-if="isEnableXcm"
              :xcm-assets="xcmAssets.assets"
              class="container"
            />
          </template>
        </div>
      </div>

      <div class="column--links">
        <side-ads />
        <astar-domains />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { isValidEvmAddress } from '@astar-network/astar-sdk-core';
import Account from 'src/components/assets/Account.vue';
import AnchorLinks from 'src/components/assets/AnchorLinks.vue';
import EvmAssetList from 'src/components/assets/EvmAssetList.vue';
import EvmNativeToken from 'src/components/assets/EvmNativeToken.vue';
import NativeAssetList from 'src/components/assets/NativeAssetList.vue';
import SideAds from 'src/components/assets/SideAds.vue';
import XcmNativeAssetList from 'src/components/assets/XcmNativeAssetList.vue';
import YourProject from 'src/components/assets/YourProject.vue';
import ZkAstr from 'src/components/assets/ZkAstr.vue';
import AstarDomains from 'src/components/header/mobile/AstarDomains.vue';
import { providerEndpoints } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { useAccount, useBalance, useDispatchGetDapps, useNetworkInfo } from 'src/hooks';
import { CombinedDappInfo, useDappStaking, useDapps } from 'src/staking-v3';
import RegisterBanner from 'src/staking-v3/components/RegisterBanner.vue';
import Staking from 'src/staking-v3/components/my-staking/Staking.vue';
import { useStore } from 'src/store';
import { EvmAssets, XcmAssets, XvmAssets } from 'src/store/assets/state';
import { Asset } from 'src/v2/models';
import { computed, defineComponent, onUnmounted, ref, watch, watchEffect } from 'vue';

export default defineComponent({
  components: {
    Account,
    SideAds,
    AstarDomains,
    EvmAssetList,
    XcmNativeAssetList,
    YourProject,
    Staking,
    EvmNativeToken,
    NativeAssetList,
    ZkAstr,
    AnchorLinks,
    RegisterBanner,
  },
  setup() {
    const token = ref<Asset | null>(null);
    const isModalXcmBridge = ref<boolean>(false);
    const isModalXcmTransfer = ref<boolean>(false);
    const { isDappStakingV3 } = useDappStaking();

    const store = useStore();
    const { currentAccount } = useAccount();

    const { accountData } = useBalance(currentAccount);
    const { isMainnet, currentNetworkIdx, evmNetworkIdx, isZkEvm, nativeTokenSymbol } =
      useNetworkInfo();
    // Memo: load the dApps data in advance, so that users can access to dApp staging page smoothly
    useDispatchGetDapps();

    const evmNetworkId = computed(() => {
      return Number(providerEndpoints[currentNetworkIdx.value].evmChainId);
    });
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
    const isH160 = computed(() => store.getters['general/isH160Formatted']);

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

    const isEnableXcm = computed(
      () => !isZkEvm.value && xcmAssets.value.assets && xcmAssets.value.assets.length > 0
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

    const { allDapps } = useDapps();
    const ownDapps = computed<CombinedDappInfo[]>(() => {
      if (!allDapps.value) return [];
      return allDapps.value.filter((dapp) => dapp.chain.owner === currentAccount.value);
    });

    const isDappOwner = computed<boolean>(() => {
      if (ownDapps.value.length > 0) return true;
      return false;
    });

    const nativeSection = ref<HTMLElement | null>(null);
    const stakingSection = ref<HTMLElement | null>(null);
    const projectSection = ref<HTMLElement | null>(null);
    const assetsSection = ref<HTMLElement | null>(null);

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
      isDappStakingV3,
      nativeTokenSymbol,
      isZkEvm,
      ownDapps,
      isDappOwner,
      nativeSection,
      stakingSection,
      projectSection,
      assetsSection,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/assets.scss';
</style>
