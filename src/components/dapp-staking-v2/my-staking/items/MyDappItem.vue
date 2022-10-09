<template>
  <div class="panel--item">
    <table>
      <thead>
        <tr>
          <th>{{ $t('myDapps.stakedAmount') }}</th>
          <th>{{ $t('myDapps.totalEarned') }}</th>
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
      <astar-button width="97" height="24" :disabled="!item.isEnabled">{{
        $t('myDapps.add')
      }}</astar-button>
      <astar-button width="97" height="24" :disabled="!item.isEnabled">{{
        $t('myDapps.unbond')
      }}</astar-button>
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