<template>
  <div v-if="isReady" class="extra-wrapper">
    <div
      class="container--main"
      :style="{ backgroundImage: `url(${isDarkTheme ? bg_img.dark : bg_img.light})` }"
    >
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
            <h3>{{ $t('snap.pleaseNote') }}:</h3>
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
        :style="buttonStyles[0]"
        :disabled="isSnapInstalled"
        @mouseover="buttonStyles[0].backgroundColor = 'blue'"
        @mouseleave="buttonStyles[0].backgroundColor = 'white'"
        @click="handleMetaMaskSnap()"
      >
        <p>
          {{ isSnapInstalled ? $t('snap.alreadyInstalled') : $t('snap.install1') }}
        </p>
      </button>
      <button
        class="card"
        :style="buttonStyles[1]"
        :disabled="!isSnapInstalled"
        @mouseover="buttonStyles[1].backgroundColor = 'blue'"
        @mouseleave="buttonStyles[1].backgroundColor = 'white'"
        @click="setWallet()"
      >
        <p>
          {{ $t('snap.install2') }}
        </p>
      </button>
      <router-link :to="Path.Assets">
        <button
          class="card"
          :style="buttonStyles[2]"
          :disabled="!isSnapInstalled || !isWalletSet"
          @mouseover="buttonStyles[2].backgroundColor = 'blue'"
          @mouseleave="buttonStyles[2].backgroundColor = 'white'"
        >
          <p>
            {{ $t('snap.install3') }}
          </p>
        </button>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { usePageReady } from 'src/hooks';
import { useStore } from 'src/store';
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Path } from 'src/router';
import { $api } from 'src/boot/api';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
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
    const isDarkTheme = computed<boolean>(() => store.getters['general/theme'] === 'DARK');
    const bg_img = {
      light: require('/src/assets/img/dapps_staking_bg_light.webp'),
      dark: require('/src/assets/img/dapps_staking_bg_dark.webp'),
    };

    const buttonStyles = ref([
      { backgroundColor: 'white' },
      { backgroundColor: 'white' },
      { backgroundColor: 'white' },
    ]);

    const isSnapInstalled = ref(false);
    let address = '';

    const handleMetaMaskSnap = async (): Promise<void> => {
      const snap = await initiatePolkadotSnap();
      isSnapInstalled.value = snap.isSnapInstalled;

      if (isSnapInstalled.value) {
        await initPolkadotSnap();
        useExtensions($api!!, store);
        const extensions = await getInjectedExtensions(true);
        const isExtensionsUpdated = extensions.some((it) => it.name === 'Snap');
        // Memo: Sync the metamask extension for users who visit our portal first time
        !isExtensionsUpdated && (await wait(3000));
        const accounts = await web3Accounts({ ss58Format: 5 });
        address = accounts.find((account) => account.meta.source === 'Snap')?.address || '';
        console.log('accounts are', accounts);
        console.log('snap address is', address);
      }
    };

    const setWallet = async () => {
      if (isSnapInstalled.value) {
        store.commit('general/setCurrentWallet', 'Snap');

        localStorage.setItem(LOCAL_STORAGE.SELECTED_WALLET, 'Snap');
        localStorage.setItem(LOCAL_STORAGE.SELECTED_ADDRESS, address ?? '');
      }
    };

    const isWalletSet = computed<boolean>(() => {
      const selectedWallet = localStorage.getItem(LOCAL_STORAGE.SELECTED_WALLET);
      const selectAddress = localStorage.getItem(LOCAL_STORAGE.SELECTED_ADDRESS);
      return selectedWallet === 'Snap' && selectAddress === address;
    });

    return {
      Path,
      isReady,
      isDarkTheme,
      bg_img,
      buttonStyles,
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
.extra-wrapper {
  max-width: $container-max-width;
  margin: 0 auto;
}
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

.divider {
  border-top: 1px solid transparent;
  border-image: linear-gradient(
    121.48deg,
    #e6007a -5.77%,
    #703ac2 13.57%,
    #0070eb 34.18%,
    #0297fb 58.08%,
    #0ae2ff 74.93%
  );
  border-image-slice: 1;
  margin-top: 80px;
  margin-bottom: 24px;
}

.container--divider {
  padding: 0 16px;
  @media (min-width: $lg) {
    padding: 0;
  }
}

.body--dark {
  .divider {
    border-color: $gray-5;
  }
}
</style>
