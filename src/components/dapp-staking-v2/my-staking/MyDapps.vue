<template>
  <div>
    <template v-if="width >= screenSize.lg">
      <div class="table-container">
        <table id="my-table">
          <thead>
            <tr>
              <th>dApps</th>
              <th>Staked Amount</th>
              <th>Total Earned</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in items" :key="t.id">
              <td>{{ t.name }}</td>
              <td>{{ t.stakedAmount.toLocaleString() }} ASTR</td>
              <td>{{ t.totalEarned.toLocaleString() }} ASTR</td>
              <td>
                <div class="row--manage">
                  <astar-button width="97" height="24" :disabled="!t.isEnabled">Add</astar-button>
                  <astar-button width="97" height="24" :disabled="!t.isEnabled"
                    >Unbond</astar-button
                  >
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
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/my-dapps.scss';
</style>
