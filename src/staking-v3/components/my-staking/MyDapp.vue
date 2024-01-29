<template>
  <div class="row">
    <div class="column column--dapp">{{ name }}</div>
    <div class="column column--amount">
      <token-balance-native :balance="amount.toString()" />
    </div>
    <div class="column column--bonus">
      <span v-if="loyalStaker" class="icon--check">
        <astar-icon-check />
      </span>
      <span v-else>-</span>
    </div>
    <div class="column column--actions">
      <div>
        <button
          type="button"
          class="btn btn--icon icon--move"
          :disabled="!actionsEnabled"
          @click="navigateToMove(address)"
        >
          <astar-icon-arrow-up-right />
        </button>
        <span class="text--mobile-menu">
          {{ $t('stakingV3.move') }}
        </span>
        <q-tooltip>
          <span class="text--tooltip">
            {{ $t('stakingV3.move') }}
          </span>
        </q-tooltip>
      </div>

      <div>
        <button
          type="button"
          class="btn btn--icon icon--unlock"
          :disabled="!actionsEnabled"
          @click="handleUnbonding(address)"
        >
          <astar-icon-arrow-up-right />
        </button>
        <span class="text--mobile-menu">
          {{ $t('stakingV3.unlock') }}
        </span>
        <q-tooltip>
          <span class="text--tooltip">
            {{ $t('stakingV3.unlock') }}
          </span>
        </q-tooltip>
      </div>

      <div>
        <button
          type="button"
          class="btn btn--icon icon--add"
          :disabled="!actionsEnabled"
          @click="navigateToVote(address)"
        >
          <astar-icon-arrow-up-right />
        </button>
        <span class="text--mobile-menu">
          {{ $t('stakingV3.add') }}
        </span>
        <q-tooltip>
          <span class="text--tooltip">
            {{ $t('stakingV3.add') }}
          </span>
        </q-tooltip>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';

export default defineComponent({
  components: {
    TokenBalanceNative,
  },
  props: {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    amount: {
      type: BigInt as unknown as PropType<bigint>,
      required: true,
    },
    loyalStaker: {
      type: Boolean,
      required: true,
    },
    actionsEnabled: {
      type: Boolean,
      required: true,
    },
    navigateToMove: {
      type: Function as unknown as PropType<(dappAddress: string) => void>,
      required: true,
    },
    navigateToVote: {
      type: Function as unknown as PropType<(dappAddress: string) => void>,
      required: true,
    },
    handleUnbonding: {
      type: Function as unknown as PropType<(dappAddress: string) => void>,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
@use './styles/staking-table.scss';
</style>
