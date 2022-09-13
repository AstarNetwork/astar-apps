<template>
  <div class="panel--item">
    <table>
      <thead>
        <tr>
          <th>Unbonding Amount</th>
          <th>Remaining Era</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>10,000 ASTR</td>
          <td>
            <div class="row--remaining-era">
              <div class="val-era">8</div>
              <astar-irregular-button>Re-bond</astar-irregular-button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="row--manage">
      <astar-button width="97" height="24" :disabled="disabled">Withdraw</astar-button>
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