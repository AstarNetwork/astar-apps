<template>
  <div>
    <template v-if="width >= screenSize.lg">
      <div class="table-container">
        <table id="my-table">
          <thead>
            <tr>
              <th>dApps</th>
              <th>Unbonding amount</th>
              <th>Remaining Era</th>
              <th>Withdraw</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in items" :key="t.id">
              <td>{{ t.name }}</td>
              <td>{{ t.unbondingAmount.toLocaleString() }} ASTR</td>
              <td>
                <div class="row--remaining-era">
                  <div>{{ t.remainingEra }}</div>
                  <astar-irregular-button width="77" height="20">Re-bond</astar-irregular-button>
                </div>
              </td>
              <td>
                <astar-button width="97" height="24" :disabled="!t.isEnabled"
                  >Withdraw</astar-button
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <template v-else>
      <DropdownList is-unbonding :items="items" />
    </template>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useBreakpoints } from 'src/hooks';
import DropdownList from './components/DropdownList.vue';

export default defineComponent({
  components: { DropdownList },
  setup() {
    const { width, screenSize } = useBreakpoints();

    //TODO: need refactor as module
    const items = [
      {
        id: 0,
        name: 'Astar Degens',
        unbondingAmount: 10000,
        remainingEra: 8,
        isEnabled: true,
      },
      {
        id: 1,
        name: 'ArthSwap',
        unbondingAmount: 10000,
        remainingEra: 8,
        isEnabled: true,
      },
      {
        id: 2,
        name: 'Starlay Finance',
        unbondingAmount: 10000,
        remainingEra: 8,
        isEnabled: false,
      },
    ];

    return {
      width,
      screenSize,
      items,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/unbonding-list.scss';
</style>
