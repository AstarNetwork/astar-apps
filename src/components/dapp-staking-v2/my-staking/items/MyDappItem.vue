<template>
  <div class="panel--item">
    <table>
      <thead>
        <tr>
          <th>Staked Amount</th>
          <th>Total Earned</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ item.stakedAmount.toLocaleString() }} ASTR</td>
          <td>{{ item.totalEarned.toLocaleString() }} ASTR</td>
        </tr>
      </tbody>
    </table>
    <div class="row--manage">
      <astar-button width="97" height="24" :disabled="!item.isEnabled">Add</astar-button>
      <astar-button width="97" height="24" :disabled="!item.isEnabled">Unbond</astar-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
});
</script>
<style lang="scss" scoped>
@import '../styles/dropdown-item.scss';
</style>