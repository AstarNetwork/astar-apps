<template>
  <modal-wrapper
    :is-modal-open="isModalImportTokens"
    :title="$t('assets.importXvmTokens')"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
  >
    <div v-if="isLoading">
      <modal-loading />
    </div>
    <div class="wrapper--modal wrapper--import-tokens">
      <div class="wrapper__row--information">
        <span class="text--md">
          {{ $t('assets.modals.riskOfImportTokens') }}
        </span>
      </div>

      <div class="box--import-tokens box--hover--active">
        <div class="box__title">
          <span class="text--md">
            {{ $t('assets.modals.erc20ContractAddress') }}
          </span>
        </div>
        <div>
          <input
            v-model="searchErc20"
            type="text"
            placeholder="e.g. 0xd9aF35a156FD891de9DcB45f07858eA51ea3A3aC"
            class="input--search"
          />
        </div>
      </div>

      <div class="box--import-tokens">
        <div class="box__title">
          <span class="text--md">{{ $t('ticker') }}</span>
        </div>
        <div>
          <span v-if="token" class="text--title">{{ token.symbol }}</span>
        </div>
      </div>

      <div v-if="errMsg" class="row--box-error">
        <span class="color--white"> {{ $t(errMsg) }}</span>
      </div>
      <div class="wrapper__row--button">
        <astar-button
          class="button--confirm"
          :disabled="isDisabled || !token"
          @click="handleRequest"
        >
          {{ $t('confirm') }}
        </astar-button>
      </div>
    </div>
  </modal-wrapper>
</template>
<script lang="ts">
import { fadeDuration } from '@astar-network/astar-ui';
import ModalLoading from 'components/common/ModalLoading.vue';
import { $web3 } from 'src/boot/api';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { fetchErc20TokenInfo } from 'src/config/web3';
import { useNetworkInfo } from 'src/hooks';
import { wait } from 'src/hooks/helper/common';
import { Erc20Token, getStoredXvmTokens, storeImportedXvmToken } from 'src/modules/token';
import { defineComponent, ref, watch, computed } from 'vue';

export default defineComponent({
  components: {
    ModalWrapper,
    ModalLoading,
  },
  props: {
    isModalImportTokens: {
      type: Boolean,
      required: true,
    },
    handleModalImportTokens: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const isLoading = ref<boolean>(false);
    const token = ref<Erc20Token | null>(null);
    const searchErc20 = ref<string>('');
    const errMsg = ref<string>('');

    const resetStates = (): void => {
      token.value = null;
      searchErc20.value = '';
    };

    const { evmNetworkIdx } = useNetworkInfo();

    const isDisabled = computed<boolean>(() => {
      const tokens = getStoredXvmTokens();
      let isDuplicated = false;
      tokens &&
        tokens.forEach((it) => {
          const isFound =
            it.address.toLowerCase() === searchErc20.value.toLowerCase() &&
            it.srcChainId === evmNetworkIdx.value;
          if (isFound) {
            isDuplicated = true;
            errMsg.value = 'assets.tokenHasBeenAdded';
          }
        });
      return isDuplicated;
    });

    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      props.handleModalImportTokens({ isOpen: false });
      resetStates();
      isClosingModal.value = false;
    };

    const handleRequest = async (): Promise<void> => {
      if (!token.value || !searchErc20.value) {
        return;
      }
      try {
        const t = {
          srcChainId: Number(evmNetworkIdx.value),
          address: searchErc20.value,
          decimal: Number(token.value.decimal),
          symbol: token.value.symbol,
          name: token.value.name,
        };
        storeImportedXvmToken(t);
      } catch (error) {
        console.error(error);
      } finally {
        closeModal();
        window.dispatchEvent(new CustomEvent(LOCAL_STORAGE.XVM_TOKEN_IMPORTS));
      }
    };

    const handleSearchResult = async () => {
      try {
        if (isDisabled.value) return;
        const web3 = $web3.value!;
        const isValidErc20Address = searchErc20.value
          ? web3.utils.isAddress(searchErc20.value)
          : false;

        const checkAddress = (address: string, isValid: boolean): void => {
          if (address && !isValid) {
            token.value = null;
            throw Error('warning.inputtedInvalidAddress');
          }
        };

        checkAddress(searchErc20.value, isValidErc20Address);

        errMsg.value = '';
        if (searchErc20.value) {
          isLoading.value = true;
          const tokenInfo = await fetchErc20TokenInfo({
            web3,
            address: searchErc20.value,
            srcChainId: evmNetworkIdx.value,
          });
          isLoading.value = false;
          if (!tokenInfo) {
            throw Error('warning.inputtedInvalidAddress');
          }
          token.value = tokenInfo;
        } else {
          token.value = null;
        }
        errMsg.value = '';
      } catch (error: any) {
        console.error(error);
        errMsg.value = error.message;
      }
    };

    watch(
      [searchErc20],
      async () => {
        await handleSearchResult();
      },
      { immediate: false }
    );

    return {
      token,
      isClosingModal,
      searchErc20,
      isDisabled,
      isLoading,
      errMsg,
      closeModal,
      handleRequest,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-import-token.scss';
</style>
