<template>
  <div class="container">
    <div class="wrapper--staking">
      <div class="wrapper--header">
        <div class="row--title">
          <span class="icon--title"><astar-icon-dapp-staking /></span>
          <span class="text--title">{{ $t('common.staking') }}</span>
        </div>
        <div class="total--rewards">
          <token-balance-native :balance="totalStake.toString() ?? '0'" />
        </div>
      </div>

      <div class="separator" />

      <!-- TODO: add logic and show the component -->
      <migration-support v-if="false" />

      <tab-component
        :tabs="tabs"
        :tab-selected="(tabIndex) => (currentTabIndex = tabIndex)"
        :current-tab-index="currentTabIndex"
      />
      <my-staking
        v-if="currentTabIndex === 0"
        :tab-selected="(tabIndex) => (currentTabIndex = tabIndex)"
      />
      <my-dapps v-if="currentTabIndex === 1" :staked-dapps="stakerInfo" />
      <unbonding v-if="currentTabIndex === 2" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDappStaking } from '../../hooks';
import TabComponent, { TabDefinition } from './TabComponent.vue';
import MyStaking from './MyStaking.vue';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import MyDapps from './MyDapps.vue';
import Unbonding from './Unbonding.vue';
import MigrationSupport from './MigrationSupport.vue';

export default defineComponent({
  components: {
    TokenBalanceNative,
    TabComponent,
    MyStaking,
    MyDapps,
    Unbonding,
    MigrationSupport,
  },
  setup() {
    const { t } = useI18n();
    const { ledger, totalStakerRewards, stakerInfo, totalStake } = useDappStaking();
    const currentTabIndex = ref<number>(0);

    const tabs = computed<TabDefinition[]>(() => [
      { title: t('stakingV3.myStaking'), visible: true },
      { title: t('stakingV3.myDapps'), visible: stakerInfo.value?.size > 0 },
      { title: t('stakingV3.unbonding'), visible: !!ledger.value?.unlocking.length },
    ]);

    return { currentTabIndex, totalStakerRewards, stakerInfo, tabs, totalStake };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--staking {
  padding: 8px 16px;
  @media (min-width: $lg) {
    padding: 16px;
  }
}

.separator {
  background-color: $gray-2;
  height: 1px;
  margin-top: 24px;
  margin-bottom: 24px;
}

.wrapper--header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.row--title {
  display: flex;
  align-items: center;
  gap: 16px;
  text-transform: uppercase;
}

.icon--title {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  border: solid 1px $navy-4;
  svg {
    width: 22px;
    height: 22px;
    color: $navy-4;
  }
}

.text--title {
  font-weight: 600;
  @media (min-width: $lg) {
    font-size: 14px;
  }
}

.total--rewards {
  font-weight: 600;
  @media (min-width: $lg) {
    font-size: 14px;
  }
}

.body--dark {
  .row--title {
    svg {
      color: $gray-1;
    }
  }
  .separator {
    background-color: $navy-3;
  }
}
</style>
