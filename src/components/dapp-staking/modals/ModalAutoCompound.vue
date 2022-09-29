<template>
  <Modal title="Compound" @click="closeModal">
    <template #content>
      <div>
        <div class="rows">
          <div
            class="box--radio"
            :class="{ 'box--active': compoundMethod === 'auto' }"
            @click="setCompoundAuto"
          >
            <div class="radio--input">
              <input v-model="compoundMethod" type="radio" value="auto" />
            </div>
            <div class="box--content">
              <div class="box--space-between">
                <span class="text--title">
                  {{ $t('dappStaking.autoCompounding') }}
                </span>
                <img
                  v-if="isDarkTheme"
                  width="100"
                  height="23"
                  src="~assets/img/powered-by-oak-white.png"
                />
                <img v-else width="100" height="23" src="~assets/img/powered-by-oak-colored.png" />
              </div>
              <div>
                <span>{{ $t('dappStaking.automateClaimAndStake') }}</span>
              </div>
              <div class="box--inner box--yellow">
                <div>
                  <span class="text--title">
                    {{ $t('dappStaking.schedule') }}
                  </span>
                </div>
                <span>{{ $t('dappStaking.compoundSchedule') }}</span>
              </div>
              <div class="box--inner box--pink">
                <div>
                  <span class="text--title">
                    {{ $t('dappStaking.depositNoRefund') }}
                  </span>
                </div>
                <span>{{ $t('dappStaking.autoCompoundingFee') }}</span>
              </div>
            </div>
          </div>
          <div
            class="box--radio"
            :class="{ 'box--active': compoundMethod === 'claim' }"
            @click="setCompoundClaim"
          >
            <div class="radio--input">
              <input v-model="compoundMethod" type="radio" value="claim" />
            </div>
            <div class="box--content">
              <div>
                <span class="text--title">
                  {{ $t('dappStaking.claimAndRestake') }}
                </span>
              </div>
              <span>{{ $t('dappStaking.claimYourselfAuto') }}</span>
            </div>
          </div>
          <div
            class="box--radio"
            :class="{ 'box--active': compoundMethod === 'self' }"
            @click="setCompoundSelf"
          >
            <div class="radio--input">
              <input v-model="compoundMethod" type="radio" value="self" />
            </div>
            <div class="box--content">
              <div>
                <span class="text--title">
                  {{ $t('dappStaking.manageMyself') }}
                </span>
              </div>
              <span>{{ $t('dappStaking.claimYourselfManual') }}</span>
            </div>
          </div>
          <div class="tw-text-center">
            <button class="btn btn--confirm btn-size-adjust" @click="confirm">
              {{ $t('confirm') }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import Modal from 'components/common/Modal.vue';
import { useStore } from 'src/store';

export default defineComponent({
  components: {
    Modal,
  },
  emits: ['update:is-open'],
  setup(_, { emit }) {
    const store = useStore();
    const isDarkTheme = computed<boolean>(() => store.getters['general/theme'] === 'DARK');
    const compoundMethod = ref<string>('auto'); // auto, claim, self

    const setCompoundAuto = () => {
      compoundMethod.value = 'auto';
    };

    const setCompoundClaim = () => {
      compoundMethod.value = 'claim';
    };

    const setCompoundSelf = () => {
      compoundMethod.value = 'self';
    };

    const confirm = () => {
      if (compoundMethod.value === 'auto') {
        console.log('auto');
        emit('update:is-open', false);
        return;
      }

      if (compoundMethod.value === 'claim') {
        console.log('auto');
        emit('update:is-open', false);
        return;
      }

      if (compoundMethod.value === 'self') {
        emit('update:is-open', false);
        return;
      }
    };

    return {
      compoundMethod,
      setCompoundAuto,
      setCompoundClaim,
      setCompoundSelf,
      isDarkTheme,
      confirm,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/styles/modal-auto-compound.scss';
</style>
