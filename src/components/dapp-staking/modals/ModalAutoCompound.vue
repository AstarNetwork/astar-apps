<template>
  <Modal title="Compound" @click="closeModal">
    <template #content>
      <div>
        <div class="rows">
          <div class="box--input-field box--active">
            <div>
              <div class="box__space-between">
                <span class="text--title">
                  {{ $t('dappStaking.claimAndRestake') }}
                </span>
                <img
                  v-if="isDarkTheme"
                  width="100"
                  height="23"
                  src="~assets/img/powered-by-oak-white.png"
                />
                <img v-else width="100" height="23" src="~assets/img/powered-by-oak-colored.png" />
              </div>
              <span>{{ $t('dappStaking.automateClaimAndStake') }}</span>
            </div>
          </div>
          <div class="box--input-field box--active">
            <div>
              <span>{{ $t('dappStaking.claimYourselfAuto') }}</span>
            </div>
          </div>
          <div class="box--input-field box--active">
            <div>
              <span>{{ $t('dappStaking.claimYourselfManual') }}</span>
            </div>
          </div>
          <div class="tw-text-center">
            <button class="btn btn--confirm btn-size-adjust" @click="close()">
              {{ $t('confirm') }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
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

    const close = () => {
      emit('update:is-open', false);
    };

    return {
      isDarkTheme,
      close,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/styles/modal-auto-compound.scss';
</style>
