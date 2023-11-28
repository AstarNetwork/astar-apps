<template>
  <div class="wrapper--staking">
    <div class="wrapper--header">
      <div>{{ $t('common.staking') }}</div>
      <div class="total--rewards">
        <token-balance-native :balance="totalUserStake?.toString() ?? '0'" />
      </div>
    </div>
    <tab-component
      class="tab"
      :tabs="tabs"
      :tab-selected="(tabIndex) => (currentTabIndex = tabIndex)"
    />
    <my-staking v-if="currentTabIndex === 0" />
    <my-dapps v-if="currentTabIndex === 1" :staked-dapps="stakerInfo" />
    <unbonding v-if="currentTabIndex === 2" />
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

export default defineComponent({
  components: {
    TokenBalanceNative,
    TabComponent,
    MyStaking,
    MyDapps,
    Unbonding,
  },
  setup() {
    const { t } = useI18n();
    const { ledger, rewards, stakerInfo, totalUserStake } = useDappStaking();
    const currentTabIndex = ref<number>(0);

    const tabs = computed<TabDefinition[]>(() => [
      { title: t('stakingV3.myStaking'), visible: true },
      { title: t('stakingV3.myDapps'), visible: stakerInfo.value?.size > 0 },
      { title: t('stakingV3.unbonding'), visible: !!ledger.value?.unlocking.length },
    ]);

    const totalStakerRewards = computed<bigint>(
      () => (rewards?.value?.staker ?? BigInt(0)) + (rewards?.value?.bonus ?? BigInt(0))
    );

    return { currentTabIndex, totalStakerRewards, stakerInfo, tabs, totalUserStake };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--staking {
  width: 100%;
  padding: 24px;
  gap: 10px;
  border-radius: 16px;
  border: 1px solid $gray-2;
}

.wrapper--header {
  width: 100%;
  display: flex;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  padding-bottom: 16px;
  border-bottom: 1px solid $gray-2;
}

.total--rewards {
  margin-left: auto;
}

.tab {
  margin-bottom: 16px;
}
</style>
