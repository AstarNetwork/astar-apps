<template>
  <div v-if="isReady" class="">
    <div class="container--main">
      <div class="wrapper--title">
        <div class="txt--title animate__animated animate__zoomInRight">
          {{ $t('snap.name') }}
        </div>
        <div class="txt--subtitle animate__animated animate__fadeIn animate__delay-1s">
          {{ $t('snap.purpose') }}
        </div>
      </div>

      <div class="staking-container">
        <div class="wrapper--tabs responsive">
          <div class="wrapper--panel">
            <p>
              {{ $t('snap.description') }}
              <a
                href="https://docs.astar.network/docs/use/manage-wallets/wallet-providers/metamask-astar-snap/"
                target="_blank"
              >
                {{ $t('snap.documentation') }}
              </a>
            </p>
            <br />
            <b>{{ $t('snap.pleaseNote') }}:</b>
            <ul>
              <li>
                {{ $t('snap.pn1') }}
              </li>
              <li>
                {{ $t('snap.pn2') }}
              </li>
              <li>
                {{ $t('snap.pn3') }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="cards responsive">
      <button
        class="card"
        :class="{ 'card-hover': isHovered }"
        @mouseover="isHovered = true"
        @mouseleave="isHovered = false"
        @click="isSnapInstalled ? $router.push(Path.Assets) : handleMetaMaskSnap()"
      >
        <div class="card__logo">
          <img :src="icon_img.metamask" width="30" />
        </div>
        <div v-if="!isLoading" class="card__title">
          {{ isSnapInstalled ? $t('snap.gotoAssets') : $t('snap.install') }}
        </div>
        <astar-spinner v-else />
      </button>
    </div>
  </div>
  <astar-spinner v-else />
</template>

<script lang="ts">
import { usePageReady } from 'src/hooks';
import { useStore } from 'src/store';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Path } from 'src/router';
import { $api } from 'src/boot/api';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { web3Accounts } from '@polkadot/extension-dapp';
import { wait } from '@astar-network/astar-sdk-core';
import { getInjectedExtensions } from 'src/hooks/helper/wallet';
import { useExtensions } from 'src/hooks/useExtensions';
import { initiatePolkadotSnap } from 'src/modules/snap';
import { initPolkadotSnap } from '@astar-network/metamask-astar-adapter';

export default defineComponent({
  name: 'Snap',
  setup() {
    const store = useStore();
    const { isReady } = usePageReady();
    const { t } = useI18n();

    const isHovered = ref(false);
    const isSnapInstalled = ref(false);
    const isWalletSet = ref(false);
    const isLoading = ref(false);
    const address = ref('');

    const icon_img = {
      metamask: require('/src/assets/img/metamask.png'),
    };

    const handleMetaMaskSnap = async (): Promise<void> => {
      const snap = await initiatePolkadotSnap();
      isSnapInstalled.value = snap.isSnapInstalled;

      if (isSnapInstalled.value) {
        isLoading.value = true;
        await initPolkadotSnap();
        useExtensions($api!!, store);
        const extensions = await getInjectedExtensions(true);
        const isExtensionsUpdated = extensions.some((it) => it.name === 'Snap');
        !isExtensionsUpdated && (await wait(3000));
        const accounts = await web3Accounts({ ss58Format: 5 });
        address.value = accounts.find((account) => account.meta.source === 'Snap')?.address || '';
        setWallet();
        isLoading.value = false;
      }
    };

    const setWallet = () => {
      if (isSnapInstalled.value) {
        store.commit('general/setCurrentWallet', 'Snap');
        console.log('snap address is', address.value);

        localStorage.setItem(LOCAL_STORAGE.SELECTED_WALLET, 'Snap');
        localStorage.setItem(LOCAL_STORAGE.SELECTED_ADDRESS, address.value ?? '');

        isWalletSet.value = true;
      }
    };

    return {
      Path,
      icon_img,
      isReady,
      isHovered,
      isLoading,
      isSnapInstalled,
      isWalletSet,
      setWallet,
      handleMetaMaskSnap,
    };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
@import 'src/components/dapp-staking/my-staking/styles/top-metric.scss';
@import 'src/components/dapp-staking/my-staking/styles/my-staking.scss';

.container--main {
  width: 100%;
  padding: 0px 0px 24px 0px;
  margin: 0 auto;

  @media (min-width: $md) {
    max-width: 720px;
  }

  @media (min-width: $widthCardLineUp) {
    max-width: 100%;
  }
  @media (min-width: $lg) {
    margin-top: 50px;
  }
}

.card {
  position: relative;
  padding: 20px;
  min-height: 200px;
}

.card__logo {
  position: absolute;
  top: 20px;
  right: 20px;
}

.card__title {
  position: absolute;
  bottom: 20px;
  left: 20px;
  text-align: left;
  font-weight: 600;
  font-size: 32px;
  line-height: 1.2;
}

.card-hover {
  background-color: $astar-blue;
}
</style>
