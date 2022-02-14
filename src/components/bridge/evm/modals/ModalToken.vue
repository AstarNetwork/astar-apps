<template>
  <Modal title="Select a token" class="animate__animated animate__fadeIn" @click="closeModal">
    <template v-if="filteredTokens" #content>
      <div class="row-token-input">
        <input
          class="token-input"
          :class="isDarkTheme && 'token-input-dark'"
          placeholder="Search token by name or address"
          :value="inputValue"
          @input="inputHandler"
        />
      </div>
      <div
        v-if="tokens.length > 0"
        id="virtual-scroll-target"
        class="scroll"
        :style="
          width > 425
            ? `height: ${tokens.length * 75}px; width:460px`
            : 'height: 250px; width:360px'
        "
      >
        <q-virtual-scroll
          v-if="filteredTokens.length > 0"
          scroll-target="#virtual-scroll-target"
          :items="filteredTokens"
        >
          <template #default="{ item, index }">
            <q-item :key="index" dense>
              <q-item-section>
                <q-item-label>
                  <div class="token-items">
                    <Token
                      :key="index"
                      :token="item"
                      :selected-token="selectedToken"
                      :select-token="selectToken"
                      :src-chain-id="srcChainId"
                    />
                  </div>
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-virtual-scroll>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, watchEffect, computed, ref, watch } from 'vue';
import Token from './Token.vue';
import Modal from 'src/components/common/Modal.vue';
import { useBreakpoints } from 'src/hooks';
import { useStore } from 'src/store';
import { SelectedToken } from 'src/c-bridge';
import { getTokenBal } from 'src/config/web3';
export default defineComponent({
  components: {
    Token,
    Modal,
  },
  props: {
    closeModal: {
      type: Function,
      required: true,
    },
    selectToken: {
      type: Function,
      required: true,
    },
    tokens: {
      type: Array,
      required: true,
    },
    selectedToken: {
      type: Object,
      required: true,
    },
    modal: {
      type: String,
      required: true,
    },
    srcChainId: {
      type: Number,
      required: true,
    },
  },
  setup({ tokens, modal, srcChainId }) {
    const title = modal === 'src' ? 'Select Source Chain' : 'Select Destination Chain';
    const filteredTokens = ref<SelectedToken[] | []>([]);
    const inputValue = ref<string>('');
    const { width } = useBreakpoints();
    const store = useStore();
    const isDarkTheme = computed(() => store.getters['general/theme'] === 'DARK');
    const selectedAddress = computed(() => store.getters['general/selectedAddress']);
    const computedSrcChainId = computed(() => srcChainId);

    const inputHandler = (event: any): void => {
      inputValue.value = event.target.value;
    };

    watch(
      [computedSrcChainId, selectedAddress],
      async () => {
        if (!selectedAddress.value) return;
        const tokenArray = tokens as SelectedToken[];
        filteredTokens.value = await Promise.all(
          tokenArray.map(async (token: SelectedToken) => {
            const userBalance = await getTokenBal({
              srcChainId,
              address: selectedAddress.value,
              tokenAddress: token.address,
              tokenSymbol: token.symbol,
            });

            return {
              ...token,
              userBalance,
            };
          })
        );
      },
      { immediate: true }
    );

    watchEffect(async () => {
      const tokenArray = tokens as SelectedToken[];
      if (inputValue.value === '') {
        filteredTokens.value = tokenArray;
      } else {
        const value = inputValue.value.toLowerCase();
        const result = tokenArray
          .map((token: SelectedToken) => {
            const isFoundToken =
              value === token.address.toLowerCase() ||
              token.symbol.toLowerCase().includes(value) ||
              token.name.toLowerCase().includes(value);
            return isFoundToken ? token : null;
          })
          .filter((it) => it !== null) as SelectedToken[];
        filteredTokens.value = result ?? [];
      }
    });

    return { title, width, isDarkTheme, filteredTokens, inputHandler, inputValue };
  },
});
</script>

<style lang="scss" scoped>
@import '../styles/bridge-modal';
</style>
