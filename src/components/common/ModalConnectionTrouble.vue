<template>
  <modal-wrapper
    :is-modal-open="show"
    :title="$t('assets.modals.connectionTroubles.connectionTroubles')"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
  >
    <div class="wrapper--modal-connection-trouble">
      <div class="row--description">
        <span class="text--md">
          {{ $t('assets.modals.connectionTroubles.tipsDescription') }}
        </span>
      </div>
      <div class="wrapper--tips">
        <div class="container--tips">
          <div class="row--tips-title">
            <span class="text--tips-title"
              >{{ $t('assets.modals.connectionTroubles.tryOtherEndpoints') }}
            </span>
          </div>
          <div>
            <span class="text--md">
              {{ $t('assets.modals.connectionTroubles.changeFromHeader') }}
            </span>
          </div>
        </div>

        <div class="container--tips">
          <div class="row--tips-title">
            <span class="text--tips-title">
              {{ $t('assets.modals.connectionTroubles.clearLocalStorage') }}
            </span>
            <astar-button :width="120" @click="clearLocalStorage">
              <span class="text--button">{{ $t('clear') }}</span>
            </astar-button>
          </div>
          <div class="row--tips">
            <span class="text--md">
              {{ $t('assets.modals.connectionTroubles.clearLocalStorageTip') }}
            </span>
          </div>
        </div>

        <div class="container--tips">
          <div class="row--tips-title">
            <a
              :href="polkadotJsLink"
              target="_blank"
              rel="noopener noreferrer"
              class="link--tips-title"
            >
              {{ $t('assets.modals.connectionTroubles.metaUpdate') }}
            </a>
          </div>
          <div class="row--tips">
            <span class="text--md">
              {{ $t('assets.modals.connectionTroubles.metaUpdateTip') }}
            </span>
          </div>
        </div>

        <div class="container--tips">
          <div class="row--tips-title">
            <a
              :href="docsUrl.troubleShooting"
              target="_blank"
              rel="noopener noreferrer"
              class="link--tips-title"
            >
              {{ $t('assets.modals.connectionTroubles.goToDocs') }}
            </a>
          </div>
          <div class="row--tips">
            <span class="text--md">
              {{ $t('assets.modals.connectionTroubles.goToDocsTip') }}
            </span>
          </div>
        </div>

        <div class="container--tips">
          <div class="row--tips-title">
            <span class="text--tips-title">
              {{
                $t(
                  width > screenSize.sm
                    ? 'assets.modals.connectionTroubles.askCommunityDiscord'
                    : 'assets.modals.connectionTroubles.askCommunity'
                )
              }}
            </span>
            <astar-button :width="120">
              <span class="text--button">{{ $t('join') }}</span>
            </astar-button>
          </div>
          <div class="row--tips">
            <span class="text--md">
              {{ $t('assets.modals.connectionTroubles.askCommunityTip') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </modal-wrapper>
</template>

<script lang="ts">
import { truncate, wait } from '@astar-network/astar-sdk-core';
import { fadeDuration } from '@astar-network/astar-ui';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';
import { defineComponent, ref, computed } from 'vue';
import { docsUrl, polkadotJsUrl } from 'src/links';
import { useBreakpoints, useNetworkInfo } from 'src/hooks';
import { endpointKey } from 'src/config/chainEndpoints';
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
    const { currentNetworkIdx } = useNetworkInfo();
    const { width, screenSize } = useBreakpoints();

    const polkadotJsLink = computed<string>(() => {
      const { astar, shiden, shibuya } = polkadotJsUrl.settings;
      return currentNetworkIdx.value === endpointKey.ASTAR
        ? astar
        : currentNetworkIdx.value === endpointKey.SHIDEN
        ? shiden
        : shibuya;
    });

    const clearLocalStorage = async (): Promise<void> => {
      localStorage.clear();
      store.dispatch('general/showAlertMsg', {
        msg: t('toast.clearedLocalStorage'),
        alertType: 'success',
      });
      await closeModal();
      await wait(5000);
      window.location.reload();
    };

    return {
      docsUrl,
      polkadotJsLink,
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
@use 'src/components/common/styles/modal-connection-trouble.scss';
</style>
