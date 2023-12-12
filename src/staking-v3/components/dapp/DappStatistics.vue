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
            <token-balance-native :balance="dapp.chain.totalStake?.toString() || '0'" />
          </span>
        </div>
      </div>
      <!-- <div class="separator--statistics" />
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
      </div> -->
      <div class="separator--statistics" />
      <div class="row--statistics">
        <div>
          <span class="text--statistics-title">
            {{ $t('stakingV3.tier') }}
          </span>
        </div>
        <div>
          <span class="text--statistics-value">
            {{ getDappTier(dapp.chain.id) ?? '--' }}
          </span>
        </div>
      </div>
      <!-- <div class="separator--statistics" />
      <div class="row--statistics">
        <div>
          <span class="text--statistics-title">
            {{ $t('dappStaking.dappPage.v3.totalEarned') }}
          </span>
        </div>
        <div>
          <span class="text--statistics-value">
            {{ $t('amountToken', { amount: 10, token: nativeTokenSymbol }) }}
          </span>
        </div>
      </div> -->
    </div>
  </div>
</template>
<script lang="ts">
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import { useDappStaking } from 'src/staking-v3/hooks';
import { CombinedDappInfo } from 'src/staking-v3/logic';
import { defineComponent, PropType } from 'vue';
export default defineComponent({
  components: {
    TokenBalanceNative,
  },
  props: {
    dapp: {
      type: Object as PropType<CombinedDappInfo>,
      required: true,
    },
  },
  setup() {
    const { getDappTier } = useDappStaking();

    return { getDappTier };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/staking-v3/components/dapp/styles/dapp-statistics.scss';
</style>
