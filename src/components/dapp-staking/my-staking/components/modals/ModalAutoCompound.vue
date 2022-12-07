<template>
  <modal-wrapper
    :is-modal-open="show"
    :title="$t('myReward.compound')"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
  >
    <div>
      <div class="rows">
        <div
          class="box--radio"
          :class="{ 'box--active': compoundMethod === 'auto' }"
          @click="setCompoundAuto"
        >
          <div class="radio--input">
            <astar-radio-btn class="radio-btn" :checked="compoundMethod === 'auto'" />
          </div>
          <div class="box--content">
            <div class="box--space-between">
              <span class="text--title">
                {{ $t('myReward.autoCompounding') }}
              </span>
              <img
                v-if="isDarkTheme"
                width="100"
                height="23"
                src="~assets/img/powered-by-oak-white.png"
              />
              <img v-else width="100" height="23" src="~assets/img/powered-by-oak-colored.png" />
            </div>
            <div class="text--gray">
              <span>{{ $t('myReward.automateClaimAndStake') }}</span>
            </div>
            <div class="box--inner box--yellow">
              <div>
                <span class="text--title">
                  {{ $t('myReward.schedule') }}
                </span>
              </div>
              <span>{{ $t('myReward.compoundSchedule') }}</span>
            </div>
            <div class="box--inner box--pink">
              <div>
                <span class="text--title">
                  {{ $t('myReward.depositNoRefund') }}
                </span>
              </div>
              <span>{{ $t('myReward.autoCompoundingFee') }}</span>
            </div>
          </div>
        </div>
        <div
          class="box--radio"
          :class="{ 'box--active': compoundMethod === 'stake' }"
          @click="setCompoundStake"
        >
          <div class="radio--input">
            <astar-radio-btn class="radio-btn" :checked="compoundMethod === 'stake'" />
          </div>
          <div class="box--content">
            <div>
              <span class="text--title">
                {{ $t('myReward.claimAndRestake') }}
              </span>
            </div>
            <span class="text--gray">{{ $t('myReward.claimYourselfAuto') }}</span>
          </div>
        </div>
        <div
          class="box--radio"
          :class="{ 'box--active': compoundMethod === 'free' }"
          @click="setCompoundFree"
        >
          <div class="radio--input">
            <astar-radio-btn class="radio-btn" :checked="compoundMethod === 'free'" />
          </div>
          <div class="box--content">
            <div>
              <span class="text--title">
                {{ $t('myReward.manageMyself') }}
              </span>
            </div>
            <span class="text--gray">{{ $t('myReward.claimYourselfManual') }}</span>
          </div>
        </div>
        <div class="tw-text-center">
          <astar-button class="button--confirm" @click="confirm">{{ $t('confirm') }}</astar-button>
        </div>
      </div>
    </div>
  </modal-wrapper>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';
import { useStore } from 'src/store';
import { fadeDuration } from '@astar-network/astar-ui';
import { wait } from 'src/hooks/helper/common';

export default defineComponent({
  components: {
    ModalWrapper,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:is-open', 'confirm'],
  setup(props, { emit }) {
    const store = useStore();
    const isDarkTheme = computed<boolean>(() => store.getters['general/theme'] === 'DARK');
    const compoundMethod = ref<string>('stake'); // TODO: set from data auto, stake, free

    const setCompoundAuto = () => {
      compoundMethod.value = 'auto';
    };

    const setCompoundStake = () => {
      compoundMethod.value = 'stake';
    };

    const setCompoundFree = () => {
      compoundMethod.value = 'free';
    };

    const isClosingModal = ref<boolean>(false);
    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      emit('update:is-open', false);
      isClosingModal.value = false;
    };

    const confirm = () => {
      closeModal();
      emit('confirm', compoundMethod.value);
    };

    return {
      compoundMethod,
      setCompoundAuto,
      setCompoundStake,
      setCompoundFree,
      isDarkTheme,
      isClosingModal,
      closeModal,
      confirm,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.rows {
  display: grid;
  row-gap: 16px;
  margin-bottom: 8px;
}

.btn-size-adjust {
  @media (min-width: $xs) {
    width: 344px;
  }
  @media (min-width: $md) {
    width: 400px;
  }
  @media (min-width: $xl) {
    width: 420px;
  }
}

.box--space-between {
  display: flex;
  justify-content: space-between;
}

.box--content {
  display: grid;
  row-gap: 12px;
}

.box--radio {
  display: flex;
  flex-direction: row;
  padding: 20px 20px 20px 0;
  border-radius: 6px;
  width: 320px;
  background: transparent;
  cursor: pointer;

  border: 1px solid $gray-3;
  @media (min-width: $xs) {
    width: 344px;
  }
  @media (min-width: $md) {
    width: 400px;
  }
  @media (min-width: $xl) {
    width: 420px;
  }
}

.box--inner {
  display: grid;
  row-gap: 12px;
  padding: 9px 15px;
  border-radius: 6px;

  transition: all 0.3s ease 0s;
}

.box--yellow {
  background: rgba(240, 185, 11, 0.2);
  border: 1px solid #f0b90b !important;
}

.box--pink {
  background: rgba(255, 86, 33, 0.2);
  border: 1px solid #ff5621;
}

.body--dark {
  .box--input-field {
    background: $gray-6;
    border: 1px solid $gray-4;
  }
  input {
    color: white;
  }

  .text--connect-rpc {
    color: $astar-blue;
  }
  .row--box-error {
    background: $box-red-dark;
  }
  .box--warning--checked {
    background: $box-red-dark;
  }
  .color--not-checked {
    color: $gray-1;
  }
  .text--to--balance {
    color: $gray-4;
  }
}

.radio--input {
  display: flex;
  justify-content: center;
  align-items: center;

  input {
    background-color: transparent;
    color: $astar-blue;
  }
}

.radio-btn {
  margin-left: 10px;
}

.text--gray {
  color: $gray-3;
}

.button--confirm {
  width: 340px;
  font-size: 22px;
  font-weight: 600;
  height: 44px;
  @media (min-width: $md) {
    width: 400px;
  }
}
</style>