<template>
  <Modal title="Compound" @click="closeModal">
    <template #content>
      <div>
        <div class="rows">
          <div class="box--input-field box--active">
            <div class="box__space-between">
              <span>{{ $t('dappStaking.automateClaimAndStake') }}</span>
            </div>
          </div>
          <div class="box--input-field box--active">
            <div class="box__space-between">
              <span>{{ $t('dappStaking.claimYourselfAuto') }}</span>
            </div>
          </div>
          <div class="box--input-field box--active">
            <div class="box__space-between">
              <span>{{ $t('dappStaking.claimYourselfManual') }}</span>
            </div>
          </div>
          <div class="tw-text-center">
            <Button @click="close()">
              {{ $t('close') }}
            </Button>
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script>
import { defineComponent } from 'vue';
import Modal from 'components/common/Modal.vue';
import Button from 'components/common/Button.vue';

export default defineComponent({
  components: {
    Modal,
    Button,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  setup(_, { emit }) {
    const close = () => {
      emit('update:is-open', false);
    };

    return {
      close,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/styles/modal-auto-compound.scss';
</style>
