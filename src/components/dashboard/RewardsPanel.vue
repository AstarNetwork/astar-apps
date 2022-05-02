<template>
  <div v-if="isLoading">
    <q-skeleton class="skeleton--value-panel" />
  </div>
  <div v-else class="wrapper--value">
    <div class="container container--value">
      <div class="row--2-column">
        <span class="text--accent container--title--color">{{
          $t(
            width > screenSize.xl
              ? 'dashboard.earned.earnedRewardsDappStaking'
              : 'dashboard.earned.earnedRewards'
          )
        }}</span>
        <span class="text--label container--title--color">
          {{ getShortenAddress(currentAccount) }}
        </span>
      </div>
      <div class="align-right text--xlg">
        <div>
          <span class="text--value text-color--neon"> {{ $n(earned) }} {{ symbol }} </span>
        </div>
        <div>
          <span class="text--label text-color--neon"> ${{ $n(nativeTokenUsd * earned) }} </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import { useAccount, useBreakpoints, usePrice } from 'src/hooks';
import { formatNumber, TOKEN_API_URL } from 'src/modules/token-api';
import { defineComponent, ref, watchEffect, computed } from 'vue';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import { useStore } from 'src/store';

export default defineComponent({
  props: {
    symbol: {
      type: String,
      required: true,
    },
  },
  setup() {
    const { currentAccount } = useAccount();
    const earned = ref<number>(0);
    const isLoading = ref<boolean>(true);

    const { width, screenSize } = useBreakpoints();
    const { nativeTokenUsd } = usePrice();
    const store = useStore();
    const currentNetworkName = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      const chain = chainInfo ? chainInfo.chain : '';
      return chain === 'Shibuya Testnet' ? 'Shibuya' : chain;
    });

    const loadStats = async (): Promise<void> => {
      const url = `${TOKEN_API_URL}/v1/${currentNetworkName.value.toLowerCase()}/dapps-staking/earned/${
        currentAccount.value
      }`;
      const result = await axios.get<number>(url);
      earned.value = result.data;
    };

    watchEffect(async () => {
      try {
        if (currentNetworkName.value && currentAccount.value) {
          isLoading.value = true;
          await loadStats();
          isLoading.value = false;
        }
      } catch (error) {
        console.error(error);
        isLoading.value = false;
      }
      if (!currentAccount.value) {
        isLoading.value = false;
      }
    });

    return {
      currentAccount,
      width,
      screenSize,
      earned,
      isLoading,
      nativeTokenUsd,
      getShortenAddress,
      formatNumber,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/chart-panel.scss';
</style>
