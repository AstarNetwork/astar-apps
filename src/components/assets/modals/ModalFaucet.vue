<template>
  <astar-simple-modal
    v-if="!isLoading"
    :show="isModalFaucet"
    title="Faucet"
    :is-closing="isClosingModal"
    @close="closeModal"
  >
    <div class="wrapper--modal wrapper--faucet">
      <div class="wrapper__row--title">
        <span class="text--accent">{{ $t('assets.modals.whatIsFaucet') }}</span>
      </div>
      <div class="wrapper__row--information">
        <span class="text--md">{{ $t('assets.modals.faucetIntro') }}</span>
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
      <div v-if="isAbleToFaucet" class="wrapper__row--button">
        <button class="btn btn--confirm" :disabled="!recaptchaResponse" @click="handleRequest">
          {{ $t('confirm') }}
        </button>
      </div>
    </div>
  </astar-simple-modal>
</template>
<script lang="ts">
import { useFaucet } from 'src/hooks';
import { defineComponent, computed, ref } from 'vue';
import { fadeDuration } from '@astar-network/astar-ui';
import { wait } from 'src/hooks/helper/common';
import vueRecaptcha from 'vue3-recaptcha2';
import { RECAPCHA_SITE_KEY } from 'src/config/recapcha';
import { useStore } from 'src/store';

export default defineComponent({
  components: {
    vueRecaptcha,
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
    const isDarkTheme = computed(() => store.getters['general/theme'] === 'DARK');

    const isModalFaucet = computed(() => props.isModalFaucet);
    const { requestFaucet, isLoading, unit, isAbleToFaucet, countDown, faucetAmount } =
      useFaucet(isModalFaucet);

    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;

      await wait(fadeDuration);
      props.handleModalFaucet({ isOpen: false });
      isClosingModal.value = false;
    };

    const handleRequest = async () => {
      try {
        await requestFaucet(recaptchaResponse.value);
      } catch (error) {
        console.error(error);
      } finally {
        closeModal();
      }
    };

    const recaptchaVerified = (response: string) => {
      recaptchaResponse.value = response;
    };

    const recaptchaExpired = () => {
      recaptchaResponse.value = '';
    };

    const recaptchaFailed = () => {
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
