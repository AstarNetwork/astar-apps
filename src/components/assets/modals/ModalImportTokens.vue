<template>
  <astar-simple-modal
    :show="isModalImportTokens"
    :title="$t('assets.importTokens')"
    :is-closing="isClosingModal"
    @close="closeModal"
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

      <div class="wrapper__row--button">
        <button class="btn btn--confirm" :disabled="isDisabled" @click="handleRequest">
          {{ $t('confirm') }}
        </button>
      </div>
    </div>
  </astar-simple-modal>
</template>
<script lang="ts">
import { fadeDuration } from '@astar-network/astar-ui';
import { $web3 } from 'src/boot/api';
import { SelectedToken } from 'src/c-bridge';
import { getProviderIndex, providerEndpoints } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { fetchErc20TokenInfo } from 'src/config/web3';
import { wait } from 'src/hooks/helper/common';
import { Erc20Token, storeImportedERC20Token } from 'src/modules/token';
import { useStore } from 'src/store';
import { computed, defineComponent, PropType, ref, watch } from 'vue';

export default defineComponent({
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
      type: Object as PropType<SelectedToken[]>,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const token = ref<Erc20Token | null>(null);
    const search = ref<string>('');

    const resetStates = (): void => {
      token.value = null;
      search.value = '';
    };

    const store = useStore();
    const evmNetworkIdx = computed<number>(() => {
      const chainInfo = store.getters['general/chainInfo'];
      const chain = chainInfo ? chainInfo.chain : '';
      const networkIdx = getProviderIndex(chain);
      return Number(providerEndpoints[networkIdx].evmChainId);
    });

    const isDisabled = computed<boolean>(() => {
      const isToken = !token.value;
      let isDuplicated = false;

      props.tokens.forEach((it) => {
        if (it.address.toLowerCase() === search.value.toLowerCase()) {
          isDuplicated = true;
        }
      });
      const result = isToken || isDuplicated;
      return result;
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
        // Memo: Update tokens in useCbridgeV2.ts
        window.dispatchEvent(new CustomEvent(LOCAL_STORAGE.EVM_TOKEN_IMPORTS));
      }
    };

    const handleSearchResult = async () => {
      const web3 = $web3.value!;
      const isValidAddress = search.value ? web3.utils.isAddress(search.value) : false;

      if (!isValidAddress && search.value) {
        // Todo: add error message
        token.value = null;
        return;
      }

      if (search.value) {
        token.value = await fetchErc20TokenInfo({
          web3,
          address: search.value,
          srcChainId: evmNetworkIdx.value,
        });
      } else {
        token.value = null;
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
      closeModal,
      handleRequest,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-import-token.scss';
</style>
