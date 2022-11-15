<template>
  <div class="wrapper-main">
    <TopMetric />

    <Register />

    <BannerArea />

    <div v-if="isStakeAble">
      <div class="divider" />
      <MyStaking />
    </div>

    <div class="divider"></div>

    <DappList category="DeFi" />

    <q-intersection transition="fade" transition-duration="1000" once>
      <AdsArea />
    </q-intersection>

    <div class="divider"></div>

    <DappList category="NFT" />

    <div class="divider"></div>

    <DappList category="Tooling" />

    <div class="divider"></div>

    <DappList category="Utility" />

    <div class="divider"></div>

    <DappList category="Others" />
  </div>
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import DappList from 'src/components/dapp-staking-v2/my-staking/DappList.vue';
import MyStaking from 'src/components/dapp-staking-v2/my-staking/MyStaking.vue';
import Register from 'src/components/dapp-staking-v2/my-staking/Register.vue';
import TopMetric from 'src/components/dapp-staking-v2/my-staking/TopMetric.vue';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { wait } from 'src/hooks/helper/common';
import { useStore } from 'src/store';
import { computed, defineComponent, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import AdsArea from './my-staking/AdsArea.vue';
import BannerArea from './my-staking/BannerArea.vue';

export default defineComponent({
  components: {
    TopMetric,
    MyStaking,
    DappList,
    AdsArea,
    Register,
    BannerArea,
  },
  setup() {
    useMeta({ title: 'Discover dApps' });
    const store = useStore();

    const { currentNetworkName } = useNetworkInfo();
    const { currentAccount } = useAccount();
    const { t } = useI18n();
    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
    const isStakeAble = computed<boolean>(() => !!currentAccount.value && !isH160.value);
    const dapps = computed(() => store.getters['dapps/getAllDapps']);

    watch([isH160], () => {
      if (isH160.value) {
        store.dispatch('general/showAlertMsg', {
          msg: t('dappStaking.error.onlySupportsSubstrate'),
          alertType: 'error',
        });
      }
    });

    watch(
      [currentNetworkName],
      () => {
        store.dispatch('dapps/getTvl');
      },
      { immediate: false }
    );

    // Memo: invoke this function whenever the users haven't connect to wallets
    const getDappsForBrowser = async (): Promise<void> => {
      // Memo (4 secs): quick hack for waiting for updating `currentAccount` state from the initial state
      await wait(4000);
      const isBrowsingOnly = !!(
        dapps.value.length === 0 &&
        !currentAccount.value &&
        currentNetworkName.value
      );

      if (isBrowsingOnly) {
        store.dispatch('dapps/getDapps', {
          network: currentNetworkName.value.toLowerCase(),
          currentAccount: '',
        });
      }
    };

    const getDapps = async (): Promise<void> => {
      const isConnectedWallet = currentNetworkName.value && currentAccount.value;
      if (isConnectedWallet) {
        const address = isH160.value || !currentAccount.value ? '' : currentAccount.value;
        store.dispatch('dapps/getDapps', {
          network: currentNetworkName.value.toLowerCase(),
          currentAccount: address,
        });
      } else {
        getDappsForBrowser();
      }
    };

    watch(
      [currentAccount, currentNetworkName],
      async () => {
        await getDapps();
      },
      { immediate: false }
    );

    return { isStakeAble };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper-main {
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
    margin-top: 48px;
  }
}

.divider {
  border-top: 1px solid $object-light;
  margin-top: 24px;
  margin-bottom: 24px;
}

.body--dark {
  .divider {
    border-color: $gray-5;
  }
}
</style>
