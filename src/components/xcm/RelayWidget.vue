<template>
  <div class="container--bridge animate__animated animate__fadeIn">
    <div class="widget" :class="isDarkTheme && 'widget-dark'">
      <div class="row">
        <div class="currency">
          <span class="label">{{ $t('from') }}</span>
          <div class="chain" :class="isDarkTheme && 'chain-dark'" @click="openModal('src')">
            <!-- <img :src="srcChain.icon" alt="src-chain-logo" class="chain-logo" /> -->
            <span class="chain-name"> Kusama </span>
            <span class="under-arrow">▼</span>
          </div>
        </div>
        <div>
          <div
            class="input-row"
            :class="[isDarkTheme && 'input-row-dark', 'input-row-native-token']"
          >
            <input
              :value="amount"
              inputmode="decimal"
              type="number"
              min="0"
              pattern="^[0-9]*(\.)?[0-9]*$"
              placeholder="0"
              :class="'input-native-token'"
              @input="inputHandler"
            />
            <!-- <button
              v-if="nativeCurrency[srcChain.id].name !== selectedToken.symbol"
              class="max-button"
              :class="isDarkTheme && 'max-button-dark'"
              @click="toMaxAmount"
            >
              {{ $t('bridge.max') }}
            </button> -->
            <div
              class="token-selector"
              :class="isDarkTheme && 'token-selector-dark'"
              @click="openModal('token')"
            >
              <!-- <img
                :src="getIcon({ symbol: selectedToken.symbol, icon: selectedToken.icon })"
                alt="token-logo"
                class="token-logo"
              /> -->
              <span>{{ selectedToken.metadata.symbol }}</span>
              <span>▼</span>
            </div>
          </div>
          <div class="information label">
            <div v-if="selectedTokenBalance" class="balance">
              <p>{{ $t('bridge.balance') }}</p>
              <p>
                {{
                  $n(
                    formatDecimals({
                      amount: selectedTokenBalance,
                      decimals: 6,
                    })
                  )
                }}
                {{ selectedToken.metadata.symbol }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="reverse" :class="isDarkTheme && 'reverse-dark'">
        <button class="reverse-button" :class="isDarkTheme && 'reverse-button-dark'">↑↓</button>
      </div>
      <div v-if="destChain" class="row">
        <div class="currency">
          <span class="label">{{ $t('to') }}</span>
          <div class="chain" :class="isDarkTheme && 'chain-dark'" @click="openModal('dest')">
            <!-- <img
              v-if="destChain"
              :src="destChain.icon"
              alt="destChain-chain-logo"
              class="chain-logo"
            /> -->
            <span class="chain-name">Shiden</span>
            <span class="under-arrow">▼</span>
          </div>
        </div>
      </div>
      <div v-if="errMsg && amount" class="err-msg-container">
        <p class="err-msg">{{ errMsg }}</p>
      </div>
      <!-- <BridgeButtons
        :bridge="bridge"
        :handle-approve="handleApprove"
        :is-disabled-bridge="isDisabledBridge"
        :is-approval-needed="isApprovalNeeded"
        :selected-network="selectedNetwork"
        :src-chain-id="srcChain.id"
      /> -->
    </div>

    <ModalToken
      v-if="modal === 'token'"
      v-model:isOpen="modal"
      :close-modal="closeModal"
      :select-token="selectToken"
      :tokens="tokens"
      :selected-token="selectedToken"
      :src-chain-id="srcChain.id"
      :modal="modal"
    />

    <ModalChain
      v-if="modal === 'src'"
      v-model:isOpen="modal"
      :close-modal="closeModal"
      :select-chain="selectChain"
      :chains="srcChains"
      :modal="modal"
      :selected-chain="srcChain"
    />

    <ModalChain
      v-if="modal === 'dest'"
      v-model:isOpen="modal"
      :close-modal="closeModal"
      :select-chain="selectChain"
      :chains="destChains"
      :modal="modal"
      :selected-chain="destChain"
    />
  </div>
</template>

<script lang="ts">
import { fasHistory } from '@quasar/extras/fontawesome-v5';
import { useMeta } from 'quasar';
import { useStore } from 'src/store';
import { computed, defineComponent, watchEffect } from 'vue';
import BridgeButtons from './BridgeButtons.vue';
import ModalChain from './modals/ModalChain.vue';
import ModalToken from './modals/ModalToken.vue';
import { endpointKey } from 'src/config/chainEndpoints';
import { nativeCurrency } from 'src/config/web3';
import { useXcmBridge, formatDecimals } from 'src/hooks/xcm/useXcmBridge';

export default defineComponent({
  components: {
    ModalChain,
    ModalToken,
    // BridgeButtons,
  },
  setup() {
    useMeta({ title: 'Relay Bridge' });
    const store = useStore();
    const isDarkTheme = computed(() => store.getters['general/theme'] === 'DARK');
    const selectedToken = computed(() => store.getters['xcm/selectedToken']);

    const {
      srcChain,
      destChain,
      srcChains,
      destChains,
      tokens,
      modal,
      errMsg,
      selectedTokenBalance,
      amount,
      closeModal,
      openModal,
      inputHandler,
      selectChain,
      selectToken,
      bridge,
    } = useXcmBridge();

    return {
      fasHistory,
      isDarkTheme,
      amount,
      srcChain,
      destChain,
      srcChains,
      destChains,
      tokens,
      modal,
      errMsg,
      selectedToken,
      selectedTokenBalance,
      closeModal,
      openModal,
      inputHandler,
      selectChain,
      selectToken,
      bridge,
      endpointKey,
      nativeCurrency,
      formatDecimals,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/xcm-bridge.scss';
</style>
