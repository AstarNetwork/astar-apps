<template>
  <div class="container container--extra-padding-bottom">
    <div class="row">
      <span class="text--title">{{ $t('assets.assets') }}</span>
    </div>

    <div class="border--separator" />

    <div class="rows">
      <div class="row row--details">
        <div class="row__left">
          <div class="column--currency">
            <img width="24" src="icons/astar.png" alt="wallet-icon" />
            <div class="column--ticker">
              <span class="text--title">ASTR</span>
              <span class="text--label--accent">Astar</span>
            </div>
          </div>
        </div>
        <div class="row__right">
          <div class="column column--balance">
            <div class="column__box">
              <div class="text--accent">
                <span>100,000.125 ASTR</span>
              </div>
              <div class="text--label">
                <span>100,000.125 USD</span>
              </div>
            </div>
          </div>
          <div class="column--asset-buttons">
            <button class="btn btn--sm bg--astar color--astar">{{ $t('assets.transfer') }}</button>
            <!-- Memo: activate it when bridge feature is available in the native network -->
            <!-- <button class="btn btn--sm bg--astar">Bridge</button> -->
            <!-- Memo: if eligible to call faucet -->
            <button class="btn btn--sm bg--astar color--astar">{{ $t('assets.faucet') }}</button>
          </div>
        </div>
      </div>
      <!-- EVM deposit -->
      <div class="row--bg--extend row--details bg--accent">
        <div class="row__left">
          <span class="text--md">{{ $t('assets.haveDepositedFromEvm') }}</span>
        </div>
        <div class="row__right">
          <div class="column--balance">
            <div class="column__box">
              <span class="text--value">100.125 ASTR</span>
            </div>
          </div>
          <div class="column--buttons">
            <button class="btn btn--sm bg--astar color--astar">{{ $t('assets.withdraw') }}</button>
          </div>
        </div>
      </div>
      <!-- Vesting Info -->
      <div class="row--bg--extend row--details bg--accent">
        <div class="row__left">
          <div>
            <span class="text--md">{{ $t('assets.yourVestingInfo') }}</span>
          </div>
          <div class="row--staking">
            <span class="text--md">{{ $t('assets.inStaking') }}</span>
          </div>
        </div>
        <div class="row__right">
          <div class="column column--balance">
            <div class="column__box">
              <span class="text--value">600,000 ASTR</span>
              <span class="text--value">(500,000 ASTR)</span>
            </div>
          </div>
          <div class="column column--buttons">
            <button class="btn btn--sm bg--astar color--astar">{{ $t('assets.view') }}</button>
            <button class="btn btn--sm bg--astar color--astar">{{ $t('manage') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { getProviderIndex } from 'src/config/chainEndpoints';
import { useStore } from 'src/store';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  setup() {
    const store = useStore();

    const currentNetworkIdx = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      const chain = chainInfo ? chainInfo.chain : '';
      return getProviderIndex(chain);
    });

    return {};
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/native-assets.scss';
</style>
