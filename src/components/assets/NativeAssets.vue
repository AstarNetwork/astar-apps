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
              <span class="text--label--accent">{{
                tokenSymbol === 'SBY' ? 'Shibuya' : currentNetwork
              }}</span>
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
          <div
            class="column--asset-buttons"
            :class="(isShibuya || mainnetFaucetAmount > bal) && 'column--buttons--2-columns'"
          >
            <button class="btn btn--sm bg--astar color--astar">{{ $t('assets.transfer') }}</button>
            <!-- Memo: activate it when bridge feature is available in the native network -->
            <!-- <button class="btn btn--sm bg--astar">Bridge</button> -->
            <button
              v-if="isShibuya || mainnetFaucetAmount > bal"
              class="btn btn--sm bg--astar color--astar"
            >
              {{ $t('assets.faucet') }}
            </button>
          </div>
        </div>
      </div>
      <div v-if="numEvmDeposit > 0" class="row--bg--extend row--details bg--accent">
        <div class="row__left">
          <span class="text--md">{{ $t('assets.haveDepositedFromEvm') }}</span>
        </div>
        <div class="row__right">
          <div class="column--balance">
            <div class="column__box">
              <span class="text--value">{{ $n(numEvmDeposit) }} {{ tokenSymbol }}</span>
            </div>
          </div>
          <div class="column--buttons">
            <button class="btn btn--sm bg--astar color--astar">{{ $t('assets.withdraw') }}</button>
          </div>
        </div>
      </div>
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
              <span class="text--value">{{ $n(vestingTtl) }} {{ tokenSymbol }}</span>
              <span class="text--value">({{ $n(lockInDappStaking) }} {{ tokenSymbol }})</span>
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
import { useBalance, useEvmDeposit } from 'src/hooks';
import { getUsdPrice } from 'src/hooks/helper/price';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watchEffect } from 'vue';

export default defineComponent({
  setup() {
    const bal = ref<number>(0);
    const balUsd = ref<number>(0);
    const vestingTtl = ref<number>(0);
    const lockInDappStaking = ref<number>(0);
    const isShibuya = ref<boolean>(false);
    // Memo: defined by hard-coding to avoid sending too many requests to faucet API server
    const mainnetFaucetAmount = 0.002;

    const store = useStore();
    const selectedAddress = computed(() => store.getters['general/selectedAddress']);
    const { balance, accountData } = useBalance(selectedAddress);
    const { numEvmDeposit } = useEvmDeposit();
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
        isShibuya.value = tokenSymbolRef === 'SBY';
        bal.value = Number(ethers.utils.formatEther(balance.value.toString()));
        const coingeckoTicker = tokenSymbolRef === 'SDN' ? 'shiden' : 'astar';
        if (!isShibuya.value) {
          balUsd.value = (await getUsdPrice(coingeckoTicker)) * bal.value;
        }
      } catch (error: any) {
        console.error(error.message);
      }
    });

    watchEffect(() => {
      const accountDataRef = accountData.value;
      if (!accountDataRef) return;
      // Memo: `vesting ` -> there has been inputted 1 space here
      const vesting = accountDataRef.locks.find((it) => it.toHuman().id === 'vesting ');
      const dappStake = accountDataRef.locks.find((it) => it.toHuman().id === 'dapstake');

      if (vesting) {
        const amount = String(vesting.toHuman().amount).replace(/,/g, '');
        vestingTtl.value = Number(ethers.utils.formatEther(amount));
      }
      if (dappStake) {
        const amount = String(dappStake.toHuman().amount).replace(/,/g, '');
        lockInDappStaking.value = Number(ethers.utils.formatEther(amount));
      }
    });

    return {
      bal,
      tokenSymbol,
      balUsd,
      currentNetwork,
      numEvmDeposit,
      isShibuya,
      mainnetFaucetAmount,
      vestingTtl,
      lockInDappStaking,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/native-assets.scss';
</style>
