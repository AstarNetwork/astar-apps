<template>
  <div v-if="isStaker" class="wrapper--user-rewards-container">
    <div class="container user-rewards-container dark:tw-bg-darkGray-800">
      <div class="row">
        <div>
          <span class="title container--title--color">{{ $t('dappStaking.yourRewards') }}</span>
        </div>
        <div v-if="currentAccount" class="container--claimed">
          <span> {{ claimedRewards }}</span>
        </div>
      </div>
      <div class="user-rewards-panel">
        <ClaimAll />
        <CompoundReward />
        <Withdraw :show-unbonded-funds="true" />
        <Withdraw :show-unbonded-funds="false" :show-unbonding-chunks="true" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ClaimAll from 'src/components/dapp-staking/ClaimAll.vue';
import CompoundReward from 'src/components/dapp-staking/statistics/CompoundReward.vue';
import Withdraw from 'src/components/dapp-staking/statistics/Withdraw.vue';
import { useAccount, useBreakpoints } from 'src/hooks';
import { useCompoundRewards } from 'src/hooks/dapps-staking/useCompoundRewards';
import { getClaimedAmount } from 'src/modules/token-api';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  components: {
    CompoundReward,
    ClaimAll,
    Withdraw,
  },
  setup() {
    const store = useStore();
    const { t, n } = useI18n();
    const { isStaker } = useCompoundRewards();
    const { width, screenSize } = useBreakpoints();
    const { currentAccount } = useAccount();
    const claimed = ref<number>(0);
    const isLoadingClaimed = ref<boolean>(true);
    const isH160 = computed(() => store.getters['general/isH160Formatted']);

    const nativeTokenSymbol = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo.tokenSymbol : '';
    });

    const currentNetworkName = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      const chain = chainInfo ? chainInfo.chain : '';
      return chain === 'Shibuya Testnet' ? 'Shibuya' : chain;
    });

    const claimedRewards = computed(() => {
      const amount = n(claimed.value);
      const text =
        width.value > screenSize.sm
          ? 'dappStaking.claimedRewards.long'
          : 'dappStaking.claimedRewards.short';
      return t(text, { amount, symbol: nativeTokenSymbol.value });
    });

    watchEffect(async () => {
      try {
        if (currentNetworkName.value && currentAccount.value && !isH160.value) {
          isLoadingClaimed.value = true;
          const result = await getClaimedAmount({
            network: currentNetworkName.value.toLowerCase(),
            account: currentAccount.value,
          });
          claimed.value = result;
          isLoadingClaimed.value = false;
        }
      } catch (error) {
        console.error(error);
        isLoadingClaimed.value = false;
      }
      if (!currentAccount.value) {
        isLoadingClaimed.value = false;
      }
    });

    return {
      isStaker,
      width,
      screenSize,
      claimedRewards,
      currentAccount,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/styles/user-rewards.scss';
</style>
