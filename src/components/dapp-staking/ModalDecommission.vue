<template>
  <astar-default-modal
    v-if="show"
    :show="show"
    :is-closing="isClosingModal"
    :width="580"
    :class="'highest-z-index wrapper--modal-onboarding'"
    @close="closeModal"
  >
    <div class="modal__top">
      <div class="title--onboarding">We are nearly there...</div>
      <div class="subtitle--onboarding">
        We suspend some transactions to prepare for the new dApp Staking launch on
        {{ currentNetworkName }} Network. We will let you know very soon.
      </div>
    </div>
    <div class="modal__bottom">
      <div class="modal__bottom-inner">
        <div class="swiper--modal-onboarding">
          While we are preparing for dApp Staking v3 release, we now<br />
          <b>stopped following transactions</b>
          <ul>
            <li>Staking and nomination transfer</li>
          </ul>
          <br />
          <p>dApp Staking is working and any other transactions are also working as usual</p>
          <ul>
            <li>Claim, Withdraw and Unstake</li>
          </ul>
          <br />
          <p>Launch date - To be announced</p>
        </div>
      </div>
      <div class="bg--modal-onboarding">
        <img :src="require('/src/staking-v3/assets/leaderboard_bg.webp')" alt="" />
      </div>
    </div>
  </astar-default-modal>
</template>

<script lang="ts">
import { wait } from '@astar-network/astar-sdk-core';
import { fadeDuration } from '@astar-network/astar-ui';
import { defineComponent, ref } from 'vue';
import { useNetworkInfo } from 'src/hooks';
export default defineComponent({
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
    const { currentNetworkName } = useNetworkInfo();
    const isClosingModal = ref<boolean>(false);
    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      props.setIsOpen(false);
      isClosingModal.value = false;
    };

    return {
      isClosingModal,
      currentNetworkName,
      closeModal,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.modal__top {
  margin: -60px 0 20px 0;
}

.title--onboarding {
  font-size: 28px;
  font-style: italic;
  font-weight: 400;
  padding: 0 40px;
  @media (min-width: $sm) {
    font-size: 40px;
    padding: 0;
  }
}

.subtitle--onboarding {
  font-style: italic;
  font-size: 16px;
}

.modal__bottom {
  position: relative;
  padding: 40px;
  overflow: hidden;
  background-color: $navy-1;
  border-radius: 0 0 6px 6px;
  @media (min-width: $sm) {
    margin: 0 -40px -40px -40px;
  }
}

.modal__bottom-inner {
  position: relative;
  z-index: 1;
  color: $gray-2;
  padding-top: 40px;
  @media (min-width: $sm) {
    padding-top: 60px;
  }
}

.swiper--modal-onboarding {
  font-size: 16px;
  width: 100%;

  ul {
    list-style-type: disc;
    margin-left: 24px;
    font-size: 20px;
    font-weight: 600;
  }
}

.text--title {
  color: white;
  font-size: 28px;
  font-style: italic;
  font-weight: 700;
  max-width: 300px;
  line-height: 1.15;
  @media (min-width: $sm) {
    font-size: 40px;
    max-width: 420px;
  }
  a {
    transition: all 0.2s ease;
    color: #0ae2ff;
    display: flex;
    gap: 8px;
    align-items: center;
    &:hover {
      color: lighten(#0ae2ff, 25%);
    }
    svg {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }
  }
}

.text--yellow {
  color: #f0cd5f;
}

.text--description {
  font-size: 16px;
  font-style: italic;
  font-weight: 200;
  max-width: 300px;
  @media (min-width: $sm) {
    max-width: 420px;
    font-size: 24px;
  }
}

.text--links {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  a {
    transition: all 0.2s ease;
    color: white;
    font-size: 14px;
    font-style: italic;
    font-weight: 500;
    display: flex;
    gap: 4px;
    align-items: center;
    @media (min-width: $sm) {
      font-size: 16px;
    }
    &:hover {
      color: #0ae2ff;
    }
    svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
  }
}

.bg--modal-onboarding {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.body--dark {
  .title--onboarding {
    color: $navy-1;
  }
}

.body--dark {
  .wrapper--modal-onboarding {
    .modal-content {
      background-color: white !important;
    }
  }
}
</style>
