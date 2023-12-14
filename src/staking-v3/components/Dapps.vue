<template>
  <div>
    <div class="wrapper--dapps">
      <div v-for="(dapp, index) in filteredDapps" :key="index">
        <div v-if="dapp" class="card--dapp" @click="navigateDappPage(dapp.basic.address)">
          <div class="card__top">
            <div class="icon--dapp">
              <img :src="dapp.basic.iconUrl" alt="icon" />
            </div>
            <div class="text--dapp">
              <div class="text--title">{{ dapp.basic.name }}</div>
              <div class="text--description">{{ dapp.basic.shortDescription }}</div>
            </div>
          </div>
          <div class="card__bottom">
            <div>T{{ getDappTier(dapp.chain.id) ?? '-' }}</div>
            <div>
              <token-balance-native :balance="dapp.chain.totalStake?.toString() ?? '0'" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="search.length > 0 && filteredDapps.length === 0" class="box--no-result">
      <span class="text--title">{{ $t('assets.noResults') }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useDappStaking, useDappStakingNavigation, useDapps } from '../hooks';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';

export default defineComponent({
  components: {
    TokenBalanceNative,
  },
  props: {
    search: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { registeredDapps } = useDapps();
    const { getDappTier } = useDappStaking();
    const { navigateDappPage } = useDappStakingNavigation();

    const filteredDapps = computed(() => {
      const dapps = registeredDapps.value;

      if (props.search === '') return dapps;

      const value = props.search.toLowerCase();

      const result = dapps
        .map((dapp) => {
          const isFoundDapp =
            dapp.basic.name.toLowerCase().includes(value) ||
            dapp.basic.shortDescription.toLowerCase().includes(value);
          return isFoundDapp ? dapp : undefined;
        })
        .filter((it) => it !== undefined);
      return result.length > 0 ? result : [];
    });

    return { registeredDapps, filteredDapps, getDappTier, navigateDappPage };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/dapps.scss';
</style>
