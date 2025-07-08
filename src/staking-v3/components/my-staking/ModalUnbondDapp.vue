<template>
  <modal-wrapper
    :is-modal-open="show"
    :title="$t('stakingV3.unlockFrom', { name: dapp?.basic.name })"
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
                  amount: $n(truncate(maxAmountDisplay)),
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
              placeholder="0"
              class="input--amount input--no-spin"
              @input="inputHandler"
              @wheel="(e) => e.preventDefault()"
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

      <rewards-panel class="panel" />

      <div class="warning">
        <li>
          {{ $t('stakingV3.unlockingDay', { unbondingPeriod: constants?.unlockingPeriod ?? '0' }) }}
        </li>
      </div>
      <error-panel :error-message="errorMessage" class="panel" />
      <astar-button class="unbond-button" :disabled="!canUnbond()" @click="unbound()"
        >{{ $t('stakingV3.startUnlocking') }}
      </astar-button>
    </div>
  </modal-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { useNetworkInfo, useGasPrice } from 'src/hooks';
import { getTokenImage } from 'src/modules/token';
import { truncate } from '@astar-network/astar-sdk-core';
import { ethers } from 'ethers';
import SpeedConfiguration from 'src/components/common/SpeedConfiguration.vue';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';
import { fadeDuration } from '@astar-network/astar-ui';
import { wait } from '@astar-network/astar-sdk-core';
import { CombinedDappInfo } from 'src/staking-v3/logic';
import { useDappStaking } from 'src/staking-v3/hooks';
import RewardsPanel from '../RewardsPanel.vue';
import ErrorPanel from '../ErrorPanel.vue';

export default defineComponent({
  components: {
    SpeedConfiguration,
    ModalWrapper,
    RewardsPanel,
    ErrorPanel,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    dapp: {
      type: Object as PropType<CombinedDappInfo>,
      required: true,
    },
    setIsOpen: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const { nativeTokenSymbol } = useNetworkInfo();
    const { selectedTip, nativeTipPrice, setSelectedTip } = useGasPrice();
    const nativeTokenImg = computed<string>(() =>
      getTokenImage({ isNativeToken: true, symbol: nativeTokenSymbol.value })
    );
    const { constants, unstake, canUnStake, getStakerInfo } = useDappStaking();

    const minStakingAmount = computed<bigint>(() => constants.value?.minStakeAmount ?? BigInt(0));

    const isBelowThanMinStaking = computed<boolean>(() => {
      return minStakingAmount.value > Number(maxAmount.value) - Number(amount.value);
    });
    const maxAmount = computed<bigint>(() => {
      const selectedDappStakes = getStakerInfo(props.dapp.chain.address);

      return selectedDappStakes ? selectedDappStakes.staked.totalStake : BigInt(0);
    });

    const maxAmountDisplay = computed<string>(() => {
      return ethers.utils.formatEther(maxAmount.value);
    });

    const amount = ref<string | null>(null);
    const errorMessage = ref<string | undefined>();
    const isMaxAmount = ref<boolean>(false);

    const toMaxAmount = (): void => {
      amount.value = ethers.utils.formatEther(maxAmount.value.toString());
      isMaxAmount.value = true;
    };

    const inputHandler = (event: any): void => {
      amount.value = event.target.value;
      isMaxAmount.value = false;
    };

    const isClosingModal = ref<boolean>(false);
    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      props.setIsOpen(false);
      isClosingModal.value = false;
    };

    const canUnbond = () => {
      const [result, message] = canUnStake(
        props.dapp.basic.address,
        ethers.utils.parseEther(amount.value ?? '0').toBigInt()
      );
      errorMessage.value = message;

      return result;
    };

    const unbound = async (): Promise<void> => {
      await closeModal();
      const unlockAmount = isMaxAmount.value
        ? maxAmount.value
        : ethers.utils.parseEther(amount.value ?? '0').toBigInt();
      const unstakeAmount = isBelowThanMinStaking.value ? maxAmount.value : unlockAmount;
      if (unstakeAmount) {
        await unstake(props.dapp, unstakeAmount);
      } else {
        throw 'Invalid un-bonding amount';
      }
    };

    return {
      nativeTokenSymbol,
      nativeTokenImg,
      maxAmount,
      maxAmountDisplay,
      amount,
      selectedTip,
      nativeTipPrice,
      minStakingAmount,
      isClosingModal,
      setSelectedTip,
      close,
      toMaxAmount,
      truncate,
      inputHandler,
      unbound,
      canUnbond,
      closeModal,
      constants,
      errorMessage,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'styles/modal-unbond.scss';

.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 36px;
  padding-left: 20px;
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
  margin-bottom: 20px;
  width: 344px;
  @media (min-width: $md) {
    width: 410px;
  }
}

.box--error {
  width: 344px !important;
  @media (min-width: $md) {
    width: 400px !important;
  }
}

.unbond-button {
  width: 340px;
  font-size: 22px;
  font-weight: 600;
  height: 44px;
  margin-top: 20px;
  @media (min-width: $md) {
    width: 400px;
  }
}

.panel {
  border-radius: 6px;
  width: 344px;
  @media (min-width: $md) {
    width: 410px;
  }
}
</style>
