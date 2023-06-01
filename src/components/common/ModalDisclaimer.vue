<template>
  <astar-default-modal
    v-if="show"
    :show="show"
    :title="'Disclaimer'"
    :is-closing="isClosingModal"
    :width="650"
    :class="'highest-z-index'"
    @close="setIsOpen(false)"
  >
    <div class="wrapper--modal-disclaimer">
      <div class="row--description">
        <div class="text--md">
          By accessing and using the Astar ecosystem dApps, you confirm that you are eligible to do
          so and agree to the Astar Foundation Terms of Service and Privacy Policy. You understand
          and accept that your use of the dApps is at your own risk, and they are provided on an "as
          is" and "as available" basis without any express or implied warranties of any kind.
        </div>
        <div class="text--title">Terms of Services</div>
        <div class="text--lg">1. Liability:</div>
        <div class="text--md">
          You understand and agree that the Astar Foundation shall not be held liable for any
          direct, indirect, incidental, special, consequential, or exemplary damages arising from
          your use of the Astar ecosystem dApps. This includes, but is not limited to, damages for
          loss of profits, goodwill, use, data or other intangible losses.
        </div>
        <div class="text--lg">2. Assumption of Network Risks:</div>
        <div class="text--md">
          You understand and agree that the Astar Foundation shall not be held liable for any
          direct, indirect, incidental, special, consequential, or exemplary damages arising from
          your use of the Astar ecosystem dApps. This includes, but is not limited to, damages for
          loss of profits, goodwill, use, data or other intangible losses.
        </div>
        <div class="text--lg">3. No Guarantee of Security:</div>
        <div class="text--md">
          You understand and agree that the Astar Foundation does not guarantee the security of the
          Astar ecosystem dApps or the safety of your personal information, including your wallet
          address, transaction history, and private keys. You agree to take appropriate measures to
          protect your personal information and to prevent unauthorized access to your wallet.
        </div>
        <div class="text--md">
          You also confirm that you are not a "Prohibited Person" and that neither you nor any
          person or entity that controls, is controlled by, or is under common control with you is a
          Prohibited Person. Finally, by clicking "Accept," you agree to the terms and conditions
          set forth above. If you do not agree, please click "Decline."
        </div>
      </div>

      <div class="container--buttons">
        <div class="row--button">
          <astar-button class="btn--action" @click="accept()">
            <span class="text--button">Agree</span>
          </astar-button>
        </div>
        <div class="row--button">
          <astar-button class="btn--action btn--decline" @click="setIsOpen(false)"
            >Decline</astar-button
          >
        </div>
      </div>
    </div>
  </astar-default-modal>
</template>

<script lang="ts">
import { truncate, wait } from '@astar-network/astar-sdk-core';
import { fadeDuration } from '@astar-network/astar-ui';
import { defineComponent, ref } from 'vue';
import { LOCAL_STORAGE } from 'src/config/localStorage';

export default defineComponent({
  components: {},
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

    if (localStorage.getItem(LOCAL_STORAGE.CONFIRM_COOKIE_POLICY)) {
      closeModal();
    }

    const accept = () => {
      localStorage.setItem(LOCAL_STORAGE.CONFIRM_COOKIE_POLICY, 'true');
      closeModal();
    };

    return {
      close,
      truncate,
      closeModal,
      isClosingModal,
      accept,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/common/styles/modal-disclaimer.scss';
</style>
