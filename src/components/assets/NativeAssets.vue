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
            <img
              width="24"
              :src="tokenSymbol === 'SDN' ? 'icons/sdn-token.png' : 'icons/astar.png'"
              alt="sdn"
            />
            <div class="column--ticker">
              <span class="text--title">{{ tokenSymbol }}</span>
              <span class="text--label--accent">{{ currentNetwork }}</span>
            </div>
          </div>
        </div>
        <div class="row__right">
          <div class="column column--balance">
            <div class="column__box">
              <div class="text--accent">
                <span>{{ $n(bal) }} {{ tokenSymbol }}</span>
              </div>
              <div class="text--label">
                <span>{{ $n(balUsd) }} {{ $t('usd') }}</span>
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
              <span class="text--value">100.125 {{ tokenSymbol }}</span>
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
              <span class="text--value">600,000 {{ tokenSymbol }}</span>
              <span class="text--value">(500,000 {{ tokenSymbol }})</span>
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
import { ethers } from 'ethers';
import { useBalance } from 'src/hooks';
import { getUsdPrice } from 'src/hooks/helper/price';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watchEffect } from 'vue';

export default defineComponent({
  setup() {
    const bal = ref<number>(0);
    const balUsd = ref<number>(0);
    const store = useStore();
    const selectedAddress = computed(() => store.getters['general/selectedAddress']);
    const { balance } = useBalance(selectedAddress);
    const tokenSymbol = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo.tokenSymbol : '';
    });
    const currentNetwork = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo.chain : '';
    });

    watchEffect(async () => {
      const tokenSymbolRef = tokenSymbol.value;
      if (!balance.value || !tokenSymbolRef) return;
      try {
        bal.value = Number(ethers.utils.formatEther(balance.value.toString()));
        const coingeckoTicker = tokenSymbolRef === 'SDN' ? 'shiden' : 'astar';
        if (tokenSymbolRef !== 'SBY') {
          balUsd.value = (await getUsdPrice(coingeckoTicker)) * bal.value;
        }
      } catch (error: any) {
        console.error(error.message);
      }
    });

    return { bal, tokenSymbol, balUsd, currentNetwork };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/native-assets.scss';
</style>
