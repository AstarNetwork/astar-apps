<template>
  <modal-wrapper
    :is-modal-open="isModalAddIntroduction"
    :title="$t('dappStaking.modals.introduction.title')"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
  >
    <div class="wrapper--introduction">
      <div>{{ $t('dappStaking.modals.introduction.promotionCard') }}</div>
      <q-form ref="introductionForm" class="form--introduction">
        <div class="card--swiper">
          <img :src="image" class="card__img" />
          <div class="card__bottom">
            <div>
              <div class="text--accent featured">FEATURED</div>
              <div class="text--name">{{ name }}</div>
            </div>
            <div class="text--description">
              {{
                introduction === ''
                  ? $t('dappStaking.modals.introduction.placeholder')
                  : introduction
              }}
            </div>
          </div>
        </div>
        <div>
          <q-input
            v-model="introduction"
            outlined
            :placeholder="$t('dappStaking.modals.introduction.placeholder')"
            maxlength="65"
          />
          <div class="input--introduction__helper">
            {{
              $t('dappStaking.modals.introduction.characters', { characters: introduction.length })
            }}
          </div>
        </div>

        <astar-button class="button--submit" :disabled="!canSubmit()" @click="handleSubmit()">
          {{ $t('dappStaking.modals.submit') }}
        </astar-button>
      </q-form>
    </div>
  </modal-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { fadeDuration } from '@astar-network/astar-ui';
import { wait } from '@astar-network/astar-sdk-core';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';

export default defineComponent({
  components: {
    ModalWrapper,
  },
  props: {
    isModalAddIntroduction: {
      type: Boolean,
      required: true,
    },
    handleModalAddIntroduction: {
      type: Function,
      required: true,
    },
    introductionChanged: {
      type: Function,
      required: true,
    },
    handleSubmit: {
      type: Function,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const introduction = ref<string>('');

    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;

      await wait(fadeDuration);
      props.handleModalAddIntroduction({ isOpen: false });
      isClosingModal.value = false;
    };

    const canSubmit = (): boolean => introduction.value.length >= 10;

    watch([introduction], () => {
      props.introductionChanged(introduction.value);
    });

    return {
      isClosingModal,
      introduction,
      closeModal,
      canSubmit,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '../../my-staking/styles/ads-area.scss';

.card--swiper {
  width: 270px;
  margin: auto;
  pointer-events: none;
}
.form--introduction {
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-top: 32px;
}
.input--introduction__helper {
  color: $gray-3;
  font-size: 12px;
  margin-top: 8px;
  text-align: right;
}
.button--submit {
  width: 100%;
  font-size: 22px;
  font-weight: 600;
  height: 44px;
  align-self: center;
}
</style>
