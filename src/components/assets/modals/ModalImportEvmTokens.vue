<template>
  <modal-wrapper
    :is-modal-open="isModalImportTokens"
    :title="$t('assets.importTokens')"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
  >
    <div class="wrapper--modal wrapper--import-tokens">
      <div class="wrapper__row--information">
        <span class="text--md">
          {{ $t('assets.modals.riskOfImportTokens') }}
        </span>
      </div>

      <div class="box--import-tokens box--hover--active">
        <div class="box__title">
          <span class="text--md">
            {{ $t('assets.modals.tokenContractAddress') }}
          </span>
        </div>
        <div>
          <input v-model="search" type="text" placeholder="Input Address" class="input--search" />
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

      <div v-if="errMsg && search" class="row--box-error">
        <span class="color--white"> {{ $t(errMsg) }}</span>
      </div>
      <div class="wrapper__row--button">
        <astar-button class="button--confirm" :disabled="isDisabled" @click="handleRequest">
          {{ $t('confirm') }}
        </astar-button>
      </div>
    </div>
  </modal-wrapper>
</template>
<script lang="ts">
import { fadeDuration } from '@astar-network/astar-ui';
import { $web3 } from 'src/boot/api';
import { SelectedToken } from 'src/c-bridge';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { fetchErc20TokenInfo } from 'src/config/web3';
import { useNetworkInfo } from 'src/hooks';
import { wait } from '@astar-network/astar-sdk-core';
import { Erc20Token, storeImportedERC20Token } from 'src/modules/token';
import { computed, defineComponent, ref, watch } from 'vue';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';

export default defineComponent({
  components: {
    ModalWrapper,
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
    tokens: {
      type: Array,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const token = ref<Erc20Token | null>(null);
    const search = ref<string>('');
    const errMsg = ref<string>('');

    const resetStates = (): void => {
      token.value = null;
      search.value = '';
    };

    const { evmNetworkIdx } = useNetworkInfo();

    const isDisabled = computed<boolean>(() => {
      const isToken = !token.value;
      let isDuplicated = false;

      props.tokens &&
        props.tokens.forEach((it) => {
          const token = it as SelectedToken;
          if (token.address.toLowerCase() === search.value.toLowerCase()) {
            isDuplicated = true;
            errMsg.value = 'assets.tokenHasBeenAdded';
          }
        });
      return isToken || isDuplicated;
    });

    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      props.handleModalImportTokens({ isOpen: false });
      resetStates();
      isClosingModal.value = false;
    };

    const handleRequest = async (): Promise<void> => {
      if (!token.value) return;
      try {
        storeImportedERC20Token(token.value);
      } catch (error) {
        console.error(error);
      } finally {
        closeModal();
        window.dispatchEvent(new CustomEvent(LOCAL_STORAGE.EVM_TOKEN_IMPORTS));
      }
    };

    const handleSearchResult = async () => {
      try {
        const web3 = $web3.value!;
        const isValidAddress = search.value ? web3.utils.isAddress(search.value) : false;

        if (!isValidAddress && search.value) {
          token.value = null;
          throw Error('warning.inputtedInvalidAddress');
        }

        if (search.value) {
          const tokenInfo = await fetchErc20TokenInfo({
            web3,
            address: search.value,
            srcChainId: evmNetworkIdx.value,
          });
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
      [search],
      async () => {
        await handleSearchResult();
      },
      { immediate: false }
    );

    return {
      search,
      token,
      isClosingModal,
      isDisabled,
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
