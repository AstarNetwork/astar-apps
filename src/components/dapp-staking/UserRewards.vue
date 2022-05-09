<template>
  <div v-if="isStaker" class="wrapper--user-rewards-container">
    <div class="container user-rewards-container dark:tw-bg-darkGray-800">
      <div class="row">
        <div>
          <span class="title container--title--color">{{ $t('dappStaking.yourRewards') }}</span>
        </div>
        <div v-if="currentAccount" class="container--claimed">
          <span class="text--lg"> {{ textClaimedRewards }} </span>

          <div v-if="isLoadingClaimed">
            <q-skeleton class="skeleton--rewards" />
          </div>
          <div v-else class="column--rewards-meter">
            <vue-odometer class="text--title" format=",ddd" animation="smooth" :value="claimed" />
            <span class="text--title text--symbol">{{ symbol }}</span>
          </div>
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
import VueOdometer from 'v-odometer/src';
import { wait } from 'src/hooks/helper/common';
export default defineComponent({
  components: {
    CompoundReward,
    ClaimAll,
    Withdraw,
    'vue-odometer': VueOdometer,
  },
  setup() {
    const store = useStore();
    const { t } = useI18n();
    const { isStaker } = useCompoundRewards();
    const { width, screenSize } = useBreakpoints();
    const { currentAccount } = useAccount();
    const pastClaimed = ref<number>(0);
    const isLoadingClaimed = ref<boolean>(false);
    const isH160 = computed(() => store.getters['general/isH160Formatted']);

    const claimed = computed(() => {
      // Memo: update the number of claimed rewards after users invoking claim action
      const claimedAmount = store.getters['dapps/getClaimedRewards'];
      return claimedAmount + pastClaimed.value;
    });

    const symbol = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo.tokenSymbol : '';
    });

    const currentNetworkName = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      const chain = chainInfo ? chainInfo.chain : '';
      return chain === 'Shibuya Testnet' ? 'Shibuya' : chain;
    });

    const textClaimedRewards = computed(() => {
      const text =
        width.value > screenSize.sm
          ? 'dappStaking.claimedRewards.long'
          : 'dappStaking.claimedRewards.short';
      return t(text);
    });

    const setClaimedAmount = async () => {
      const isLocalNode = currentNetworkName.value === 'Development';
      const isFetch =
        currentNetworkName.value && currentAccount.value && !isH160.value && !isLocalNode;
      try {
        if (isFetch) {
          const result = await getClaimedAmount({
            network: currentNetworkName.value.toLowerCase(),
            account: currentAccount.value,
          });
          const animationDelay = 2000;
          await wait(animationDelay);
          pastClaimed.value = result;
          isLoadingClaimed.value = false;
        }
      } catch (error) {
        console.error(error);
        isLoadingClaimed.value = false;
      }
    };

    watchEffect(async () => {
      await setClaimedAmount();
    });

    return {
      isStaker,
      width,
      screenSize,
      textClaimedRewards,
      currentAccount,
      claimed,
      symbol,
      isLoadingClaimed,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/styles/user-rewards.scss';
</style>
