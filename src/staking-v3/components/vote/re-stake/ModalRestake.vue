<template>
  <astar-default-modal
    v-if="show"
    :show="show"
    :is-closing="isClosingModal"
    :width="580"
    :title="$t('stakingV3.restake.title')"
    @close="closeModal"
  >
    <div class="wrapper">
      <div>{{ $t('stakingV3.restake.description') }}</div>
      <div class="rewards">
        <div>{{ $t('stakingV3.yourRewards') }}</div>
        <token-balance-native :balance="rewards.toString()" :decimals="0" />
      </div>
      <div>{{ $t('stakingV3.restake.rewardDistribution') }}</div>
      <astar-button class="restake-button" @click="confirm(true)">
        {{ $t('stakingV3.restake.restakeConfirmation') }}
      </astar-button>
      <astar-button class="restake-button dont-restake" @click="confirm(false)">
        {{ $t('stakingV3.restake.restakeCancelation') }}
      </astar-button>
    </div>
  </astar-default-modal>
</template>

<script lang="ts">
import { defineComponent, ref, type PropType } from 'vue';
import { fadeDuration } from '@astar-network/astar-ui';
import { wait } from '@astar-network/astar-sdk-core';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';

export default defineComponent({
  components: {
    TokenBalanceNative,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    setIsOpen: {
      type: Function,
      required: true,
    },
    rewards: {
      type: BigInt as unknown as PropType<bigint>,
      required: true,
    },
    onConfirm: {
      type: Function as PropType<(reStake: boolean) => void>,
      required: true,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      props.setIsOpen(false);
      isClosingModal.value = false;
    };

    const confirm = (reStake: boolean): void => {
      props.onConfirm?.(reStake);
      closeModal();
    };

    return {
      isClosingModal,
      closeModal,
      confirm,
    };
  },
});
</script>

<style scoped lang="scss">
@import 'src/css/quasar.variables.scss';

.wrapper {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 0 32px;
  margin-bottom: 40px;

  @media (min-width: $md) {
    padding: 0;
    margin-bottom: 0;
  }
}

.rewards {
  text-align: center;

  div {
    margin-bottom: 16px;
  }

  span {
    margin-top: 16px;
    font-size: 22px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    letter-spacing: -0.44px;
  }
}

.restake-button {
  height: 44px;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: -0.2px;

  @media (min-width: $md) {
    font-size: 20px;
  }
}

.dont-restake {
  background-color: transparent;
  background: none;
  border: 1px solid $gray-4;
  color: $gray-4;
}
</style>
