<template>
  <modal-wrapper
    :is-modal-open="show"
    :title="'Disclaimer'"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
    class-name="highest-z-index"
  >
    <div class="wrapper--modal-disclaimer">
      <div class="row--description">
        <div class="text--md">
          By accessing and using the Astar ecosystem dApps, you confirm that you are eligible to do
          so and agree to the Astar Foundation Terms of Service and Privacy Policy. You understand
          and accept that your use of the dApps is at your own risk, and they are provided on an "as
          is" and "as available" basis without any express or implied warranties of any kind.
        </div>
        <div class="text--md">Terms of Services</div>
        <div>1. Liability:</div>
        <div>
          You understand and agree that the Astar Foundation shall not be held liable for any
          direct, indirect, incidental, special, consequential, or exemplary damages arising from
          your use of the Astar ecosystem dApps. This includes, but is not limited to, damages for
          loss of profits, goodwill, use, data or other intangible losses.
        </div>
        <div>2. Assumption of Network Risks:</div>
        <div>
          You understand and agree that the Astar Foundation shall not be held liable for any
          direct, indirect, incidental, special, consequential, or exemplary damages arising from
          your use of the Astar ecosystem dApps. This includes, but is not limited to, damages for
          loss of profits, goodwill, use, data or other intangible losses.
        </div>
        <div>3. No Guarantee of Security:</div>
        <div>
          You understand and agree that the Astar Foundation does not guarantee the security of the
          Astar ecosystem dApps or the safety of your personal information, including your wallet
          address, transaction history, and private keys. You agree to take appropriate measures to
          protect your personal information and to prevent unauthorized access to your wallet.
        </div>
        <div>
          You also confirm that you are not a "Prohibited Person" and that neither you nor any
          person or entity that controls, is controlled by, or is under common control with you is a
          Prohibited Person. Finally, by clicking "Accept," you agree to the terms and conditions
          set forth above. If you do not agree, please click "Decline."
        </div>
      </div>

      <div class="container--buttons">
        <div class="row--button">
          <astar-button :width="120">
            <span class="text--button">Agree</span>
          </astar-button>
        </div>
        <div class="row--button">
          <astar-button :width="120">
            <span class="text--button">Decline</span>
          </astar-button>
        </div>
      </div>
    </div>
  </modal-wrapper>
</template>

<script lang="ts">
import { truncate, wait } from '@astar-network/astar-sdk-core';
import { fadeDuration } from '@astar-network/astar-ui';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';
import { defineComponent, ref } from 'vue';
import { useBreakpoints } from 'src/hooks';
import { useStore } from 'src/store';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  components: { ModalWrapper },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    setIsOpen: {
      type: Function,
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

    const store = useStore();
    const { t } = useI18n();
    const { width, screenSize } = useBreakpoints();

    const clearLocalStorage = async (): Promise<void> => {
      localStorage.clear();
      store.dispatch('general/showAlertMsg', {
        msg: t('toast.clearedLocalStorage'),
        alertType: 'success',
      });
      await closeModal();
    };

    return {
      width,
      screenSize,
      close,
      truncate,
      closeModal,
      isClosingModal,
      clearLocalStorage,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/common/styles/modal-disclaimer.scss';
</style>
