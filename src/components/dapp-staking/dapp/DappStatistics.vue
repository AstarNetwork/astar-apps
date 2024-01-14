<template>
  <div class="wrapper--dapp-statistics">
    <div class="column--statistics">
      <div class="row--statistics">
        <div>
          <span class="text--statistics-title">
            {{ $t('dappStaking.dappPage.totalStaked') }}
          </span>
        </div>
        <div>
          <span class="text--statistics-value">
            <token-balance
              :balance="dapp.stakerInfo.totalStakeFormatted"
              :symbol="nativeTokenSymbol"
            />
          </span>
        </div>
      </div>
      <div class="separator--statistics" />
      <div class="row--statistics">
        <div>
          <span class="text--statistics-title">
            {{ $t('dappStaking.dappPage.totalStaker') }}
          </span>
        </div>
        <div>
          <span class="text--statistics-value">
            {{ $n(dapp.stakerInfo.stakersCount) }}
          </span>
        </div>
      </div>
      <div class="separator--statistics" />
      <div class="row--statistics">
        <div>
          <span class="text--statistics-title">
            {{ $t('stakingV3.currentTier') }}
          </span>
        </div>
        <div>
          <span class="text--statistics-value">
            {{ $n(1) }}
          </span>
        </div>
      </div>
      <div class="separator--statistics" />
      <div class="row--statistics">
        <div>
          <span class="text--statistics-title">
            {{ $t('stakingV3.totalEarned') }}
          </span>
        </div>
        <div>
          <span class="text--statistics-value">
            <!-- Todo: Update logic -->
            {{ $t('amountToken', { amount: 10, token: nativeTokenSymbol }) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { useNetworkInfo } from 'src/hooks';
import { defineComponent } from 'vue';
export default defineComponent({
  components: {
    TokenBalance,
  },
  props: {
    dapp: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const { nativeTokenSymbol } = useNetworkInfo();
    return { nativeTokenSymbol };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/dapp/styles/dapp-statistics.scss';
</style>
