<template>
  <Modal title="Compound" @click="closeModal">
    <template #content>
      <div>
        <div class="rows">
          <div class="box--input-field box--active">
            <div class="box__space-between">
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
          <div class="box--input-field box--active">
            <div>
              <span class="text--title">
                {{ $t('dappStaking.claimAndRestake') }}
              </span>
            </div>
            <span>{{ $t('dappStaking.claimYourselfAuto') }}</span>
          </div>
          <div class="box--input-field box--active">
            <div>
              <span class="text--title">
                {{ $t('dappStaking.manageMyself') }}
              </span>
            </div>
            <span>{{ $t('dappStaking.claimYourselfManual') }}</span>
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
