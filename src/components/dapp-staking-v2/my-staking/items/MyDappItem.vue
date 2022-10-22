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
          <td>
            <token-balance
              :balance="ethers.utils.formatEther(item.yourStake.denomAmount.toString())"
              :symbol="nativeTokenSymbol"
              :decimals="0"
            />
          </td>
          <!-- <td>{{ item.totalEarned.toLocaleString() }} ASTR</td> -->
        </tr>
      </tbody>
    </table>
    <div class="row--manage">
      <astar-button :width="97" :height="24" :disabled="!item.isEnabled">{{
        $t('myDapps.add')
      }}</astar-button>
      <astar-button :width="97" :height="24" :disabled="!item.isEnabled">{{
        $t('myDapps.unbond')
      }}</astar-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { useNetworkInfo } from 'src/hooks';
import { ethers } from 'ethers';
export default defineComponent({
  components: { TokenBalance },
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const { nativeTokenSymbol } = useNetworkInfo();
    return { nativeTokenSymbol, ethers };
  },
});
</script>
<style lang="scss" scoped>
@import '../styles/dropdown-item.scss';
</style>
