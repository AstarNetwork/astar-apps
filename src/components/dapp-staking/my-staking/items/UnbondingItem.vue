<template>
  <div class="panel--item">
    <table>
      <thead>
        <tr>
          <th>{{ $t('myDapps.unbondingAmount') }}</th>
          <th>{{ $t('myDapps.remainingEra') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><format-balance :balance="item.amount.toString()" /></td>
          <td>
            <div class="row--remaining-era">
              <div class="val-era">{{ item.erasBeforeUnlock }}</div>
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
        >{{ $t('myDapps.withdraw') }}</astar-button
      >
    </div>

    <Teleport to="#app--main">
      <div :class="'highest-z-index'">
        <modal-withdraw
          v-model:is-open="showModalWithdraw"
          :show="showModalWithdraw"
          :withdraw-amount="totalAmount"
          @confirm="withdraw"
        />
        <!-- <ModalRebond
          v-model:is-open="showModalRebond"
          :show="showModalRebond"
          :rebond-amount="totalAmount"
          @confirm="rebond"
        /> -->
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { useUnbonding } from 'src/hooks/dapps-staking/useUnbonding';
import { ChunkInfo } from 'src/v2/models';
import FormatBalance from 'components/common/FormatBalance.vue';
import ModalWithdraw from '../components/modals/ModalWithdraw.vue';
// import ModalRebond from '../components/modals/ModalRebond.vue';

export default defineComponent({
  components: { ModalWithdraw, FormatBalance },
  props: {
    item: {
      type: Object as PropType<ChunkInfo>,
      required: true,
    },
  },
  setup() {
    const showModalWithdraw = ref(false);
    const showModalRebond = ref(false);
    // MEMO: since not possible to withdraw each chunk currently, use total amount of withdraw
    const totalAmount = ref('');

    const { withdraw } = useUnbonding();

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
    };
  },
});
</script>
<style lang="scss" scoped>
@import '../styles/dropdown-item.scss';
</style>
