<template>
  <div class="wrapper--dapps">
    <div v-for="(dapp, index) in registeredDapps" :key="index">
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
            <span class="text--label">2,432</span>
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
import { defineComponent } from 'vue';
import { useDappStaking, useDappStakingNavigation, useDapps } from '../hooks';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';

export default defineComponent({
  components: {
    TokenBalanceNative,
  },
  setup() {
    const { registeredDapps } = useDapps();
    const { getDappTier } = useDappStaking();
    const { navigateDappPage } = useDappStakingNavigation();

    return { registeredDapps, getDappTier, navigateDappPage };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/dapps.scss';
</style>
