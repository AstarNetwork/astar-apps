<template>
  <div>
    <template v-if="width >= screenSize.lg">
      <div class="table-container">
        <table id="my-table">
          <thead>
            <tr>
              <th>{{ $t('myDapps.dapps') }}</th>
              <th>{{ $t('myDapps.stakedAmount') }}</th>
              <th>{{ $t('myDapps.totalEarned') }}</th>
              <th>{{ $t('myDapps.manage') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in items" :key="t.id">
              <td>{{ t.name }}</td>
              <td><token-balance :balance="t.stakedAmount" :symbol="nativeTokenSymbol" /></td>
              <td><token-balance :balance="t.totalEarned" :symbol="nativeTokenSymbol" /></td>
              <td>
                <div class="row--manage">
                  <astar-button width="97" height="24" :disabled="!t.isEnabled">{{
                    $t('myDapps.add')
                  }}</astar-button>
                  <astar-button width="97" height="24" :disabled="!t.isEnabled">{{
                    $t('myDapps.unbond')
                  }}</astar-button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <template v-else>
      <DropdownList :items="items" />
    </template>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useBreakpoints, useNetworkInfo } from 'src/hooks';
import DropdownList from './components/DropdownList.vue';
import TokenBalance from 'src/components/common/TokenBalance.vue';

export default defineComponent({
  components: { DropdownList, TokenBalance },
  setup() {
    const { width, screenSize } = useBreakpoints();
    const { nativeTokenSymbol } = useNetworkInfo();

    //TODO: need refactor as module
    const items = [
      {
        id: 0,
        name: 'Astar Degens',
        stakedAmount: 10000,
        totalEarned: 2000.12,
        isEnabled: true,
      },
      {
        id: 1,
        name: 'ArthSwap',
        stakedAmount: 10000,
        totalEarned: 2000.12,
        isEnabled: true,
      },
      {
        id: 2,
        name: 'Starlay Finance',
        stakedAmount: 10000,
        totalEarned: 2000.12,
        isEnabled: false,
      },
    ];

    return {
      width,
      screenSize,
      items,
      nativeTokenSymbol,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/my-dapps.scss';
</style>
