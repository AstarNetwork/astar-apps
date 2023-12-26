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

      <rewards-panel />

      <div class="warning">
        <li>
          {{
            $t('dappStaking.unbondingEra', { unbondingPeriod: constants?.unlockingPeriod ?? '0' })
          }}
        </li>
      </div>

      <div
        v-if="isBelowThanMinStaking"
        class="row--box-error box--error"
        data-testid="warning-unstake-all-balance"
      >
        <span class="color--white">
          {{
            $t('dappStaking.willUnstakeAll', {
              minStakingAmount: $n(truncate(minStakingAmount)),
              symbol: nativeTokenSymbol,
            })
          }}
        </span>
      </div>

      <astar-button class="unbond-button" :disabled="!canUnbond" @click="unbound()"
        >{{ $t('dappStaking.modals.startUnbonding') }}
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
import { useStore } from 'src/store';
import { CombinedDappInfo } from 'src/staking-v3/logic';
import { useDappStaking } from 'src/staking-v3/hooks';
import RewardsPanel from '../RewardsPanel.vue';

export default defineComponent({
  components: {
    SpeedConfiguration,
    ModalWrapper,
    RewardsPanel,
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
    const { stakerInfo, constants, unstake } = useDappStaking();
    const store = useStore();

    const minStakingAmount = computed<number>(() => {
      const amt = store.getters['dapps/getMinimumStakingAmount'];
      return Number(ethers.utils.formatEther(amt));
    });

    const isBelowThanMinStaking = computed<boolean>(() => {
      return minStakingAmount.value > Number(maxAmount.value) - Number(amount.value);
    });

    const maxAmount = computed<string>(() => {
      const selectedDappStakes = stakerInfo.value?.get(props.dapp.chain.address);

      return selectedDappStakes
        ? String(
            ethers.utils.formatEther(
              (selectedDappStakes.staked.voting + selectedDappStakes.staked.buildAndEarn).toString()
            )
          )
        : '0';
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
      props.setIsOpen(false);
      isClosingModal.value = false;
    };

    const canUnbond = computed<boolean>(() => {
      return Number(amount?.value ?? 0) > 0;
    });

    const unbound = async (): Promise<void> => {
      await closeModal();
      const unstakeAmount = isBelowThanMinStaking.value ? maxAmount.value : amount.value;

      if (unstakeAmount) {
        await unstake(props.dapp, Number(unstakeAmount));
      } else {
        throw 'Invalid un-bonding amount';
      }
    };

    return {
      nativeTokenSymbol,
      nativeTokenImg,
      maxAmount,
      amount,
      selectedTip,
      nativeTipPrice,
      isBelowThanMinStaking,
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
  margin-bottom: 20px;
  width: 344px;
  @media (min-width: $md) {
    width: 400px;
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
</style>