<template>
  <modal-wrapper
    v-if="!isLoading"
    :is-modal-open="isModalFaucet"
    :title="$t('assets.faucet')"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
  >
    <div class="wrapper--modal wrapper--faucet">
      <div class="wrapper__row--title">
        <span class="text--accent">{{ $t('assets.modals.whatIsFaucet') }}</span>
      </div>
      <div class="wrapper__row--information">
        <span class="text--md">{{
          $t('assets.modals.faucetIntro', { symbol: nativeTokenSymbol })
        }}</span>
      </div>
      <div class="row--faucet-balance">
        <span class="text--md">{{
          $t('assets.modals.faucetBalance', {
            amount: $n(truncate(faucetHotWalletBalance)),
            symbol: nativeTokenSymbol,
          })
        }}</span>
      </div>
      <div class="box--faucet-amount">
        <div class="box__column-amount">
          <span class="text--accent">{{ $t('assets.modals.youWillReceive') }}</span>
          <span class="text--xl">{{ $n(faucetAmount) }} {{ unit }}</span>
        </div>
      </div>
      <div v-if="!isAbleToFaucet" class="box--faucet--next-available">
        <span class="text--accent color--warning">
          {{ $t('assets.modals.faucetNextRequest') }}</span
        >
        <span class="text--xl">
          {{
            $t('assets.modals.countDown', {
              hrs: countDown.hours,
              mins: countDown.minutes,
              secs: countDown.seconds,
            })
          }}</span
        >
      </div>
      <vue-recaptcha
        v-show="isAbleToFaucet"
        ref="vueRecaptcha"
        :sitekey="RECAPCHA_SITE_KEY"
        size="normal"
        :theme="isDarkTheme ? 'dark' : 'light'"
        @verify="recaptchaVerified"
        @expire="recaptchaExpired"
        @fail="recaptchaFailed"
      >
      </vue-recaptcha>

      <div v-if="faucetAmount > Number(faucetHotWalletBalance)" class="row--box-error">
        <span class="color--white">
          {{ $t('assets.modals.faucetDriedOut') }}
        </span>
      </div>
      <div v-if="isAbleToFaucet" class="wrapper__row--button">
        <astar-button :disabled="!recaptchaResponse" class="button--confirm" @click="handleRequest">
          {{ $t('confirm') }}
        </astar-button>
      </div>
    </div>
  </modal-wrapper>
</template>
<script lang="ts">
import { useFaucet, useNetworkInfo } from 'src/hooks';
import { defineComponent, computed, ref } from 'vue';
import { fadeDuration } from '@astar-network/astar-ui';
import { wait } from 'src/hooks/helper/common';
import vueRecaptcha from 'vue3-recaptcha2';
import { RECAPCHA_SITE_KEY } from 'src/config/recapcha';
import { useStore } from 'src/store';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';
import { truncate } from 'src/hooks/helper/common';

export default defineComponent({
  components: {
    vueRecaptcha,
    ModalWrapper,
  },
  props: {
    isModalFaucet: {
      type: Boolean,
      required: true,
    },
    handleModalFaucet: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const recaptchaResponse = ref<string>('');

    const store = useStore();
    const isDarkTheme = computed<boolean>(() => store.getters['general/theme'] === 'DARK');
    const { nativeTokenSymbol } = useNetworkInfo();

    const isModalFaucet = computed<boolean>(() => props.isModalFaucet);
    const {
      requestFaucet,
      isLoading,
      unit,
      isAbleToFaucet,
      countDown,
      faucetAmount,
      faucetHotWalletBalance,
    } = useFaucet(isModalFaucet);

    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;

      await wait(fadeDuration);
      props.handleModalFaucet({ isOpen: false });
      isClosingModal.value = false;
    };

    const handleRequest = async (): Promise<void> => {
      try {
        await requestFaucet(recaptchaResponse.value);
      } catch (error) {
        console.error(error);
      } finally {
        closeModal();
      }
    };

    const recaptchaVerified = (response: string): void => {
      recaptchaResponse.value = response;
    };

    const recaptchaExpired = (): void => {
      recaptchaResponse.value = '';
    };

    const recaptchaFailed = (): void => {
      console.error('something went wrong');
      recaptchaResponse.value = '';
    };

    return {
      faucetAmount,
      isLoading,
      unit,
      isAbleToFaucet,
      countDown,
      isClosingModal,
      RECAPCHA_SITE_KEY,
      recaptchaResponse,
      isDarkTheme,
      nativeTokenSymbol,
      faucetHotWalletBalance,
      truncate,
      closeModal,
      handleRequest,
      recaptchaVerified,
      recaptchaExpired,
      recaptchaFailed,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-faucet.scss';
</style>
