<template>
  <div class="tw-fixed tw-z-10 tw-inset-0 tw-overflow-y-auto">
    <div class="tw-flex tw-items-center tw-justify-center tw-min-h-screen">
      <!-- Background overlay -->
      <div class="tw-fixed tw-inset-0 tw-transition-opacity" aria-hidden="true">
        <div class="tw-absolute tw-inset-0 tw-bg-gray-900 dark:tw-bg-black tw-opacity-75"></div>
      </div>

      <div
        class="
          tw-inline-block tw-bg-white
          dark:tw-bg-darkGray-900
          tw-rounded-lg tw-px-4
          sm:tw-px-8
          tw-py-10
          tw-shadow-xl
          tw-transform
          tw-transition-all
          tw-mx-2
          tw-my-2
          tw-align-middle
          tw-max-w-lg
          tw-w-full
        "
      >
        <div>
          <h3
            class="
              tw-text-lg tw-font-extrabold tw-text-blue-900
              dark:tw-text-white
              tw-mb-4 tw-text-center
            "
          >
            {{ $t('balance.faucet') }}
          </h3>

          <div class="faucet-amount">
            <span class="tw-block tw-text-left tw-font-bold tw-text-sm">
              {{ $t('balance.modals.faucetAmount') }}
            </span>
            <span class="tw-block tw-font-semibold tw-text-2xl tw-mb-1 tw-text-center">
              {{ faucetAmount }} {{ unit }}
            </span>
          </div>

          <div v-if="!isAbleToFaucet" class="tw-mb-8 tw-mt-9 tw-text-center">
            <div class="tw-text-lg tw-font-extrabold tw-text-blue-900 dark:tw-text-white">
              {{ $t('balance.modals.faucetNextRequest') }}
            </div>
            <div class="tw-text-xl tw-font-extrabold tw-text-blue-900 dark:tw-text-white">
              {{
                $t('balance.modals.countDown', {
                  hrs: countDown.hours,
                  mins: countDown.minutes,
                  secs: countDown.seconds,
                })
              }}
            </div>
          </div>
          <div class="tw-mb-8">
            <div
              class="
                tw-text-lg tw-font-extrabold tw-text-blue-900
                dark:tw-text-white
                tw-text-center tw-mb-2
              "
            >
              {{ $t('balance.modals.whatIsFaucet') }}
            </div>
            <div class="tw-text-md tw-text-blue-900 dark:tw-text-white">
              {{
                $t('balance.modals.faucetIntro', {
                  unit,
                })
              }}
            </div>
          </div>
        </div>
        <div class="tw-mt-6 tw-flex tw-justify-center tw-flex-row-reverse">
          <button :disabled="!isAbleToFaucet" type="button" class="confirm" @click="handleRequest">
            {{ $t('confirm') }}
          </button>
          <button type="button" class="cancel" @click="closeModal">
            {{ $t('cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { DateTime } from 'luxon';
import { defineComponent, onUnmounted, ref, watchEffect } from 'vue';
interface Countdown {
  hours: number;
  minutes: number;
  seconds: number;
}

export default defineComponent({
  props: {
    info: {
      type: Object,
      required: true,
    },
    requestFaucet: {
      type: Function,
      required: true,
    },
  },
  emits: ['update:is-open'],

  setup({ info: { faucet, timestamps }, requestFaucet }, { emit }) {
    const closeModal = () => {
      emit('update:is-open', false);
    };

    const openOption = ref(false);
    const faucetAmount = faucet.amount;
    const unit = faucet.unit;
    const countDown = ref<Countdown>({
      hours: 0,
      minutes: 0,
      seconds: 0,
    });

    const { nextRequestAt } = timestamps;
    const isAbleToFaucet = Date.now() > nextRequestAt;

    const handleCountDown = (): void => {
      if (!isAbleToFaucet) {
        const resetTime = DateTime.fromMillis(nextRequestAt);
        const { hours, minutes, seconds } = resetTime.diffNow(['hours', 'minutes', 'seconds']);
        countDown.value.hours = hours;
        countDown.value.minutes = minutes;
        countDown.value.seconds = Number(seconds.toFixed(0));
      }
    };

    const updateCountdown = setInterval(() => {
      handleCountDown();
    }, 1000);

    watchEffect(() => {
      handleCountDown();
    });

    onUnmounted(() => {
      clearInterval(updateCountdown);
    });

    const handleRequest = async () => {
      try {
        await requestFaucet();
      } catch (error) {
        console.error(error);
      } finally {
        closeModal();
      }
    };

    return {
      closeModal,
      countDown,
      openOption,
      faucetAmount,
      unit,
      isAbleToFaucet,
      handleRequest,
    };
  },
});
</script>

<style scoped>
.faucet-amount {
  @apply tw-w-full tw-bg-blue-500 dark:tw-bg-blue-800 tw-text-white tw-rounded-lg tw-px-5 tw-py-5 tw-mb-4 tw-relative;
}
.faucet-amount:hover {
  @apply tw-bg-blue-600 dark:tw-bg-blue-700;
}

.confirm {
  @apply tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-full tw-shadow-sm tw-text-white tw-bg-blue-500  tw-mx-1;
}
.confirm:hover {
  @apply tw-bg-blue-700 dark:tw-bg-blue-400;
}
.confirm:focus {
  @apply tw-outline-none tw-ring tw-ring-blue-100 dark:tw-ring-blue-400;
}
.cancel {
  @apply tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-text-sm tw-font-medium tw-rounded-full tw-text-gray-500 dark:tw-text-darkGray-400 tw-bg-white dark:tw-bg-darkGray-900 tw-mx-1;
}
.cancel:hover {
  @apply tw-bg-gray-100 dark:tw-bg-darkGray-700;
}
.cancel:focus {
  @apply tw-outline-none tw-ring tw-ring-gray-100 dark:tw-ring-darkGray-600;
}
</style>
