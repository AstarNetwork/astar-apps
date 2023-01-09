<template>
  <div>
    <template v-if="width >= screenSize.lg">
      <div class="table-container">
        <table id="my-table">
          <thead>
            <tr>
              <!-- <th>{{ $t('myDapps.dapps') }}</th> -->
              <th>{{ $t('myDapps.index') }}</th>
              <th>{{ $t('myDapps.unbondingAmount') }}</th>
              <th>{{ $t('myDapps.remainingEra') }}</th>
              <th>{{ $t('myDapps.withdraw') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(t, index) in unlockItems" :key="index">
              <td>Chunk {{ index + 1 }}</td>
              <td><format-balance :balance="t.amount.toString()" /></td>
              <td>
                <div class="row--remaining-era">
                  <div>{{ t.erasBeforeUnlock }}</div>
                </div>
              </td>
              <td>
                <astar-button
                  :width="97"
                  :height="24"
                  :disabled="t.erasBeforeUnlock !== 0"
                  @click="showWithdrawDialog(t.amount.toString())"
                  >{{ $t('myDapps.withdraw') }}</astar-button
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <template v-else>
      <dropdown-list is-unbonding :items="unlockItems" />
    </template>

    <Teleport to="#app--main">
      <div>
        <modal-withdraw
          v-model:is-open="showModalWithdraw"
          :show="showModalWithdraw"
          :withdraw-amount="totalAmount"
          @confirm="withdraw"
        />
        <!-- <modal-rebond
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
import { defineComponent, ref, computed, PropType } from 'vue';
import { useBreakpoints } from 'src/hooks';
import { useUnbonding } from 'src/hooks/dapps-staking/useUnbonding';
import { ChunkInfo } from 'src/v2/models';
import DropdownList from './components/DropdownList.vue';
import FormatBalance from 'components/common/FormatBalance.vue';
import ModalWithdraw from './components/modals/ModalWithdraw.vue';
// import ModalRebond from './components/modals/ModalRebond.vue';

export default defineComponent({
  components: { DropdownList, ModalWithdraw, FormatBalance },
  props: {
    unlockingChunks: {
      type: Object as PropType<ChunkInfo[] | undefined>,
      required: true,
    },
  },
  setup(props) {
    const { width, screenSize } = useBreakpoints();
    const { withdraw } = useUnbonding();

    const showModalWithdraw = ref(false);
    const showModalRebond = ref(false);
    // MEMO: since not possible to withdraw each chunk currently, use total amount of withdraw
    const totalAmount = ref('');

    const showWithdrawDialog = (amountWithdraw: string) => {
      totalAmount.value = amountWithdraw;
      showModalWithdraw.value = true;
    };

    const showRebondDialog = (amountWithdraw: string) => {
      totalAmount.value = amountWithdraw;
      showModalRebond.value = true;
    };

    const unlockItems = computed(() => {
      return props.unlockingChunks?.map((item: ChunkInfo, index) => {
        return {
          ...item,
          name: `Chunk ${index + 1}`,
        };
      });
    });

    return {
      width,
      screenSize,
      unlockItems,
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
@import './styles/unbonding-list.scss';
</style>
