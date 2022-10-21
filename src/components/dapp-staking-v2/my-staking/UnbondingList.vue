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
            <tr v-for="(t, index) in unlockingChunks" :key="index">
              <td>{{ index }}</td>
              <td><format-balance :balance="t.amount.toString()" /></td>
              <td>
                <div class="row--remaining-era">
                  <div>{{ t.unlockEra.toHuman() }}</div>
                  <astar-irregular-button
                    :width="77"
                    :height="20"
                    @click="showModalRebond = true"
                    >{{ $t('myDapps.rebond') }}</astar-irregular-button
                  >
                </div>
              </td>
              <td>
                <astar-button
                  :width="97"
                  :height="24"
                  :disabled="t.erasBeforeUnlock === 0"
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
      <DropdownList is-unbonding :items="unlockingChunks" />
    </template>

    <Teleport to="#app--main">
      <div :class="'highest-z-index'">
        <ModalWithdraw
          v-model:is-open="showModalWithdraw"
          :show="showModalWithdraw"
          :withdraw-amount="totalAmountWithdraw"
          @confirm="withdraw"
        />
        <ModalRebond v-model:is-open="showModalRebond" :show="showModalRebond" />
      </div>
    </Teleport>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue';
import { useBreakpoints, useStakerInfo } from 'src/hooks';
import { useUnbonding } from 'src/hooks/dapps-staking/useUnbonding';
import DropdownList from './components/DropdownList.vue';
import FormatBalance from 'components/common/FormatBalance.vue';
import ModalWithdraw from 'src/components/dapp-staking-v2/my-staking/components/modals/ModalWithdraw.vue';
import ModalRebond from 'src/components/dapp-staking-v2/my-staking/components/modals/ModalRebond.vue';

export default defineComponent({
  components: { DropdownList, ModalWithdraw, ModalRebond, FormatBalance },
  setup(_, { emit }) {
    const { width, screenSize } = useBreakpoints();
    const { myStakeInfos } = useStakerInfo();
    const { unlockingChunks, withdraw } = useUnbonding();

    watchEffect(() => {
      // console.log('sss', myStakeInfos.value);
    });

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

    const showModalWithdraw = ref(false);
    const showModalRebond = ref(false);
    // MEMO: since not possible to withdraw each chunk currently, use total amount of withdraw
    const totalAmountWithdraw = ref('');

    const showWithdrawDialog = (amountWithdraw: string) => {
      totalAmountWithdraw.value = amountWithdraw;
      showModalWithdraw.value = true;
    };

    return {
      width,
      screenSize,
      items,
      myStakeInfos,
      unlockingChunks,
      showModalWithdraw,
      showModalRebond,
      totalAmountWithdraw,
      showWithdrawDialog,
      withdraw,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/unbonding-list.scss';
</style>
