<template>
  <modal-wrapper
    :is-modal-open="show"
    :title="$t('dappStaking.modals.unbondFrom', { name: dapp?.name })"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
  >
    <div class="wrapper">
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

      <speed-configuration
        class="speed"
        :gas-cost="nativeTipPrice"
        :selected-gas="selectedTip"
        :set-selected-gas="setSelectedTip"
      />

      <div class="warning">
        <li>{{ $t('dappStaking.unbondingEra', { unbondingPeriod }) }}</li>
      </div>

      <astar-button class="unbond-button" :disabled="!amount" @click="unbound()"
        >{{ $t('dappStaking.modals.startUnbonding') }}
      </astar-button>
    </div>
  </modal-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { MyStakeInfo, useNetworkInfo, useUnbound, useGasPrice } from 'src/hooks';
import { getTokenImage } from 'src/modules/token';
import { truncate } from 'src/hooks/helper/common';
import { ethers } from 'ethers';
import SpeedConfiguration from 'src/components/common/SpeedConfiguration.vue';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';
import { fadeDuration } from '@astar-network/astar-ui';
import { wait } from '@astar-network/astar-sdk-core';

export default defineComponent({
  components: {
    SpeedConfiguration,
    ModalWrapper,
  },
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
    const { unbondingPeriod, handleUnbound } = useUnbound();
    const { nativeTokenSymbol } = useNetworkInfo();
    const { selectedTip, nativeTipPrice, setSelectedTip } = useGasPrice();
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

    const toMaxAmount = (): void => {
      amount.value = truncate(maxAmount.value).toString();
    };

    const inputHandler = (event: any): void => {
      amount.value = event.target.value;
    };

    const isClosingModal = ref<boolean>(false);
    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      emit('update:is-open', false);
      isClosingModal.value = false;
    };

    const unbound = async (): Promise<void> => {
      await handleUnbound(props.dapp?.dappAddress, amount.value);
      await closeModal();
    };

    return {
      nativeTokenSymbol,
      nativeTokenImg,
      maxAmount,
      amount,
      selectedTip,
      nativeTipPrice,
      unbondingPeriod,
      setSelectedTip,
      close,
      toMaxAmount,
      truncate,
      inputHandler,
      unbound,
      closeModal,
      isClosingModal,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/stake-manage/styles/stake-form.scss';

.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 36px;
  @media (min-width: $md) {
    padding-bottom: 0px;
  }
}

.box--input-field {
  margin-bottom: 20px;
}

.box__row {
  justify-content: space-between;
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

.speed {
  margin-top: 20px;
  margin-bottom: 20px;
}

.warning {
  background: rgba(240, 185, 11, 0.2);
  border: 1px solid #f0b90b;
  border-radius: 6px;
  padding: 8px;
  margin-top: 20px;
  margin-bottom: 40px;
  width: 344px;
  @media (min-width: $md) {
    width: 400px;
  }
}

.unbond-button {
  width: 340px;
  font-size: 22px;
  font-weight: 600;
  height: 44px;
  @media (min-width: $md) {
    width: 400px;
  }
}
</style>
