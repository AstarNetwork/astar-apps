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
          <td>10,000 ASTR</td>
          <td>10,000 ASTR</td>
        </tr>
      </tbody>
    </table>
    <div class="row--manage">
      <astar-button width="97" height="24" :disabled="disabled">Add</astar-button>
      <astar-button width="97" height="24" :disabled="disabled">Unbond</astar-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
});
</script>
<style lang="scss" scoped>
@import '../styles/dropdown-item.scss';
</style>