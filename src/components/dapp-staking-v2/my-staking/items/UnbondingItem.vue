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
          <td><format-balance :balance="item.amount.toString()" /></td>
          <td>
            <div class="row--remaining-era">
              <div class="val-era">{{ item.unlockEra.toHuman() }}</div>
              <astar-irregular-button
                :width="77"
                :height="20"
                @click="showRebondDialog(item.amount.toString())"
                >Re-bond</astar-irregular-button
              >
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="row--manage">
      <astar-button
        :width="97"
        :height="24"
        :disabled="item.erasBeforeUnlock !== 0"
        @click="showWithdrawDialog(item.amount.toString())"
        >Withdraw</astar-button
      >
    </div>

    <Teleport to="#app--main">
      <div :class="'highest-z-index'">
        <ModalWithdraw
          v-model:is-open="showModalWithdraw"
          :show="showModalWithdraw"
          :withdraw-amount="totalAmount"
          @confirm="withdraw"
        />
        <ModalRebond
          v-model:is-open="showModalRebond"
          :show="showModalRebond"
          :rebond-amount="totalAmount"
          @confirm="rebond"
        />
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { ChunkInfo } from 'src/hooks/dapps-staking/useUnbonding';
import { defineComponent, PropType, ref } from 'vue';
import { useUnbonding } from 'src/hooks/dapps-staking/useUnbonding';
import FormatBalance from 'components/common/FormatBalance.vue';
import ModalWithdraw from 'src/components/dapp-staking-v2/my-staking/components/modals/ModalWithdraw.vue';
import ModalRebond from 'src/components/dapp-staking-v2/my-staking/components/modals/ModalRebond.vue';

export default defineComponent({
  components: { ModalWithdraw, ModalRebond, FormatBalance },
  props: {
    item: {
      type: Object as PropType<ChunkInfo>,
      required: true,
    },
  },
  setup(_, { emit }) {
    const showModalWithdraw = ref(false);
    const showModalRebond = ref(false);
    // MEMO: since not possible to withdraw each chunk currently, use total amount of withdraw
    const totalAmount = ref('');

    const { withdraw } = useUnbonding();
    const rebond = () => {
      console.log('rebond');
    };

    const showWithdrawDialog = (amountWithdraw: string) => {
      totalAmount.value = amountWithdraw;
      showModalWithdraw.value = true;
    };

    const showRebondDialog = (amountWithdraw: string) => {
      totalAmount.value = amountWithdraw;
      showModalRebond.value = true;
    };

    return {
      showModalWithdraw,
      showModalRebond,
      totalAmount,
      showWithdrawDialog,
      showRebondDialog,
      withdraw,
      rebond,
    };
  },
});
</script>
<style lang="scss" scoped>
@import '../styles/dropdown-item.scss';
</style>