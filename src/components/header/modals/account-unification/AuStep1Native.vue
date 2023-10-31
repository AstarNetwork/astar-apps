<template>
  <div class="wrapper--account-unification">
    <div class="wrapper--instructions">
      <div>
        <div class="text--title">{{ $t('wallet.unifiedAccount.general') }}</div>
        <ul>
          <li>{{ $t('wallet.unifiedAccount.onceUnified') }}</li>
        </ul>
      </div>
      <div>
        <div class="text--title">{{ $t('wallet.unifiedAccount.evmWallet') }}</div>
        <ul>
          <li>
            <strong>{{ $t('wallet.unifiedAccount.brandNewAccount') }}</strong>
          </li>
          <li>
            {{ $t('wallet.unifiedAccount.unstakedFirst') }}
          </li>
          <li>
            {{ $t('wallet.unifiedAccount.xcTokens') }}
          </li>
          <li>
            {{ $t('wallet.unifiedAccount.automaticallyTransferred') }}
          </li>
        </ul>
      </div>
      <div>
        <div class="text--title">{{ $t('assets.nativeAccount') }}</div>
        <ul>
          <li>
            {{ $t('wallet.unifiedAccount.override') }}
          </li>
        </ul>
      </div>
    </div>

    <div class="box--warning">
      <div>
        <input v-model="isChecked" type="checkbox" class="checkbox" />
      </div>
      <div>{{ $t('wallet.unifiedAccount.agreeToProceed') }}</div>
    </div>
    <div class="box--warning box--warning--deposit">
      <div>
        <input v-model="isCheckedDeposit" type="checkbox" class="checkbox" />
      </div>
      <div>{{ $t('wallet.unifiedAccount.agreeToDeposit', { cost: totalCost }) }}</div>
    </div>
    <div>
      <astar-button class="btn" :disabled="!isChecked || !isCheckedDeposit" @click="next()">
        {{ $t('next') }}
      </astar-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  props: {
    totalCost: {
      type: String,
      required: true,
    },
  },
  emits: ['next'],
  setup(_, { emit }) {
    const next = () => {
      emit('next');
    };
    const isChecked = ref<boolean>(false);
    const isCheckedDeposit = ref<boolean>(false);

    return {
      isChecked,
      isCheckedDeposit,
      next,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account-unification.scss';

.box--warning--deposit {
  margin-top: -20px;
}
</style>
