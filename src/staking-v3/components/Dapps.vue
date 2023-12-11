<template>
  <div class="wrapper--dapps">
    <div v-for="(dapp, index) in dapps" :key="index">
      <div v-if="dapp" class="card--dapp" @click="navigateDappPage(dapp.basic.address)">
        <div class="card__top">
          <div>
            <img :src="dapp.basic.iconUrl" alt="icon" class="icon--dapp" />
          </div>
          <div>
            <span class="text--title">{{ dapp.basic.name }}</span>
          </div>
        </div>
        <div class="card__bottom">
          <div>
            <span class="text--label">T{{ getDappTier(dapp.chain.id) ?? '-' }}</span>
          </div>
          <div>
            <span class="text--label">
              <token-balance-native :balance="dapp.chain.totalStake?.toString() ?? '0'" />
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useDappStaking, useDappStakingNavigation, useDapps } from '../hooks';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import { CombinedDappInfo } from '../logic';

export default defineComponent({
  components: {
    TokenBalanceNative,
  },
  props: {
    category: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { registeredDapps } = useDapps();
    const { getDappTier } = useDappStaking();
    const { navigateDappPage } = useDappStakingNavigation();

    const dapps = computed<CombinedDappInfo[]>(() =>
      registeredDapps.value.filter(
        (x) =>
          x.basic.mainCategory?.toLowerCase() === props.category.toLowerCase() ||
          (x.basic.mainCategory === undefined && props.category.toLowerCase() === 'others')
      )
    );

    return { dapps, getDappTier, navigateDappPage };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/dapps.scss';
</style>
