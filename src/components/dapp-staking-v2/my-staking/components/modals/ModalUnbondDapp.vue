<template>
  <astar-default-modal
    :width="544"
    :height="393"
    :show="show"
    :title="$t('dappStaking.modals.unbondFrom', { name: dapp?.name })"
    @close="close"
  >
    <div class="box--input-field box--hover--active">
      <div class="box__space-between">
        <div />
        <div class="box__available">
          <span class="text--to--balance">
            {{
              $t('assets.modals.balance', {
                amount: $n(truncate(maxAmount)),
                token: nativeTokenSymbol,
              })
            }}
          </span>
          <button class="btn--max" @click="toMaxAmount">
            {{ $t('assets.modals.max') }}
          </button>
        </div>
      </div>
      <div class="box__row">
        <div class="box__row">
          <div class="token-logo">
            <img width="24" alt="token-logo" :src="nativeTokenImg" />
          </div>
          <span class="text--title">{{ nativeTokenSymbol }}</span>
        </div>
        <div class="box__column--input-amount">
          <input
            :value="amount"
            inputmode="decimal"
            type="number"
            min="0"
            pattern="^[0-9]*(\.)?[0-9]*$"
            placeholder="0.0"
            class="input--amount input--no-spin"
            @input="inputHandler"
          />
        </div>
      </div>
    </div>

    <astar-button :width="464" :height="37" :disabled="!amount">Start unbonding</astar-button>
  </astar-default-modal>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { MyStakeInfo, useNetworkInfo } from 'src/hooks';
import { getTokenImage } from 'src/modules/token';
import { truncate } from 'src/hooks/helper/common';
import { ethers } from 'ethers';

export default defineComponent({
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    dapp: {
      type: Object as PropType<MyStakeInfo | undefined>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const { nativeTokenSymbol } = useNetworkInfo();
    const nativeTokenImg = computed<string>(() =>
      getTokenImage({ isNativeToken: true, symbol: nativeTokenSymbol.value })
    );
    const maxAmount = computed<string>(() => {
      if (!props.dapp?.yourStake) {
        return '0';
      }

      return String(ethers.utils.formatEther(props.dapp.yourStake.denomAmount.toString()));
    });
    const amount = ref<string | null>(null);

    const close = () => {
      emit('update:is-open', false);
    };

    const toMaxAmount = (): void => {
      amount.value = truncate(maxAmount.value).toString();
    };

    const inputHandler = (event: any): void => {
      amount.value = event.target.value;
    };

    return {
      nativeTokenSymbol,
      nativeTokenImg,
      maxAmount,
      amount,
      close,
      toMaxAmount,
      truncate,
      inputHandler,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/stake-manage/styles/stake-form.scss';

.box--input-field {
  width: 464px;
  margin-bottom: 40px;
}

.text--guide {
  font-weight: 500;
  font-size: 14px;
}
.container {
  font-family: 'Inter';
  margin-top: 20px;
  margin-bottom: 16px;
  color: $gray-1;
  text-align: center;
  padding: 16px;

  .text--title {
    font-weight: 600;
    font-size: 14px;
  }
  .text--amount {
    font-weight: 600;
    font-size: 22px;
    margin-top: 16px;
  }
}
</style>
