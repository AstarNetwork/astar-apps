<template>
  <div class="wrapper-main">
    <TopMetric />

    <MyStaking />

    <div class="divider"></div>

    <DappList category="De-Fi" />

    <AdsArea />

    <div class="divider"></div>

    <DappList category="Infra" />

    <div class="divider"></div>

    <DappList category="NFT" />

    <Teleport to="#app--main">
      <div :class="!isLoading && 'highest-z-index'">
        <!-- <ModalRegisterDapp
          v-if="showRegisterDappModal"
          v-model:is-open="showRegisterDappModal"
          :show-close-button="false"
        /> -->
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import { useStore } from 'src/store';
import TopMetric from 'src/components/dapp-staking-v2/my-staking/TopMetric.vue';
import MyStaking from 'src/components/dapp-staking-v2/my-staking/MyStaking.vue';
import DappList from 'src/components/dapp-staking-v2/my-staking/DappList.vue';
import { computed, defineComponent, ref } from 'vue';
import AdsArea from './my-staking/AdsArea.vue';

export default defineComponent({
  components: {
    TopMetric,
    MyStaking,
    DappList,
    AdsArea,
  },
  setup() {
    useMeta({ title: 'Discover dApps' });
    const store = useStore();
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);

    return {
      isLoading,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper-main {
  padding: 0px 0px 24px 0px;
  margin: 0 auto;

  @media (max-width: $lg) {
    max-width: $lg;
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
