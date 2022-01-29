<template>
  <div>
    <div class="container">
      <div class="widget" :class="isDarkTheme && 'widget-dark'">
        <div class="row">
          <div class="currency">
            <span class="label">{{ $t('from') }}</span>
            <div class="chain" :class="isDarkTheme && 'chain-dark'" @click="openModal('src')">
              <div>
                <img v-if="srcChain" :src="srcChain.icon" alt="src-chain-logo" class="chain-logo" />
              </div>
              <span v-if="srcChain" class="chain-name">
                {{ srcChain ? getChainName(srcChain.id) : '' }}
              </span>
              <span class="under-arrow">▼</span>
            </div>
          </div>
          <div>
            <div class="input-row" :class="isDarkTheme && 'input-row-dark'">
              <input
                :value="amount"
                inputmode="decimal"
                type="number"
                min="0"
                pattern="^[0-9]*(\.)?[0-9]*$"
                placeholder="0"
                @input="inputHandler"
              />
              <div
                class="max-button"
                :class="isDarkTheme && 'max-button-dark'"
                @click="toMaxAmount"
              >
                {{ $t('bridge.max') }}
              </div>
              <div
                class="token-selector"
                :class="isDarkTheme && 'token-selector-dark'"
                @click="openModal('token')"
              >
                <div>
                  <img
                    v-if="selectedToken"
                    :src="
                      selectedToken.org_token.token.symbol === 'USDT'
                        ? logoUsdt
                        : selectedToken.org_token.icon
                    "
                    alt="token-logo"
                    class="token-logo"
                  />
                </div>
                <span>{{ selectedToken ? selectedToken.org_token.token.symbol : '' }}</span>
                <span>▼</span>
              </div>
            </div>
            <div class="information label">
              <span class="label"> ${{ $n(usdValue) }}</span>
              <div class="balance">
                <p>{{ $t('bridge.balance') }}</p>
                <p>
                  {{ selectedTokenBalance ? selectedTokenBalance : 0 }}
                  {{ selectedToken ? selectedToken.org_token.token.symbol : '' }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="reverse" :class="isDarkTheme && 'reverse-dark'" @click="reverseChain">
          <span class="reverse-button" :class="isDarkTheme && 'reverse-button-dark'">↑↓</span>
        </div>
        <div class="row">
          <div class="currency">
            <span class="label">{{ $t('to') }}</span>
            <div class="chain" :class="isDarkTheme && 'chain-dark'" @click="openModal('dest')">
              <div>
                <img
                  v-if="destChain"
                  :src="destChain.icon"
                  alt="destChain-chain-logo"
                  class="chain-logo"
                />
              </div>
              <span class="chain-name">{{ destChain ? getChainName(destChain.id) : '' }}</span>
              <span class="under-arrow">▼</span>
            </div>
          </div>
          <div>
            <div class="estimation-row" :class="isDarkTheme && 'estimation-row-dark'">
              <span class="label">{{ $t('estimated') }}</span>
              <span class="estimated-value">{{
                quotation ? quotation.estimated_receive_amt : ''
              }}</span>
            </div>
          </div>
        </div>
        <button
          v-if="!isH160"
          class="bridge-button"
          :class="isDarkTheme && 'bridge-button-dark'"
          @click="openSelectModal"
        >
          {{ $t('bridge.connectEvmWallet') }}
        </button>
        <button
          v-else-if="isApprovalNeeded"
          :disabled="selectedNetwork !== srcChain.id"
          class="bridge-button"
          :class="isDarkTheme && 'bridge-button-dark'"
          @click="handleApprove"
        >
          {{ $t('bridge.approve') }}
        </button>
        <button
          v-else
          :disabled="isDisabledBridge"
          class="bridge-button"
          :class="isDarkTheme && 'bridge-button-dark'"
          @click="bridge"
        >
          {{ $t('bridge.bridge') }}
        </button>
      </div>
      <div class="provider">
        <a
          href="https://cbridge.celer.network/#/transfer"
          target="_blank"
          rel="noopener noreferrer"
          class="powered-link"
        >
          Powered by Celer Network
        </a>
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

      <modal-connect-wallet
        v-if="walletModalName === WalletModalOption.SelectWallet"
        :set-wallet-modal="setWalletModal"
        :set-close-modal="closeWalletModal"
        :is-evm-only="true"
      />

      <ModalInstallWallet
        v-if="walletModalName === WalletModalOption.NoExtension"
        :set-close-modal="closeWalletModal"
        :selected-wallet="selectedWallet"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import { getChainName } from 'src/c-bridge';
import { useCbridge, useConnectWallet } from 'src/hooks';
import { calUsdAmount } from 'src/hooks/helper/price';
import { useStore } from 'src/store';
import { computed, defineComponent } from 'vue';
import ModalConnectWallet from '../balance/modals/ModalConnectWallet.vue';
import ModalInstallWallet from '../balance/modals/ModalInstallWallet.vue';
import ModalChain from './modals/ModalChain.vue';
import ModalToken from './modals/ModalToken.vue';

export default defineComponent({
  components: {
    ModalChain,
    ModalToken,
    ModalConnectWallet,
    ModalInstallWallet,
  },
  setup() {
    useMeta({ title: 'EVM Bridge' });

    const store = useStore();
    const isDarkTheme = computed(() => store.getters['general/theme'] === 'DARK');

    const {
      srcChain,
      destChain,
      srcChains,
      destChains,
      chains,
      tokens,
      modal,
      amount,
      selectedToken,
      quotation,
      isApprovalNeeded,
      selectedTokenBalance,
      selectedNetwork,
      isDisabledBridge,
      usdValue,
      closeModal,
      openModal,
      selectChain,
      selectToken,
      reverseChain,
      inputHandler,
      toMaxAmount,
      handleApprove,
      bridge,
    } = useCbridge();

    const {
      WalletModalOption,
      modalConnectWallet,
      modalName: walletModalName,
      selectedWallet,
      isH160,
      setCloseModal: closeWalletModal,
      setWalletModal,
      openSelectModal,
    } = useConnectWallet();

    const logoUsdt = 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png';

    return {
      getChainName,
      isDarkTheme,
      srcChain,
      destChain,
      chains,
      tokens,
      modal,
      amount,
      destChains,
      srcChains,
      selectedToken,
      quotation,
      selectedTokenBalance,
      logoUsdt,
      selectedNetwork,
      isDisabledBridge,
      usdValue,
      closeModal,
      openModal,
      selectChain,
      selectToken,
      reverseChain,
      toMaxAmount,
      bridge,
      WalletModalOption,
      modalConnectWallet,
      walletModalName,
      selectedWallet,
      isH160,
      closeWalletModal,
      setWalletModal,
      openSelectModal,
      inputHandler,
      handleApprove,
      isApprovalNeeded,
      calUsdAmount,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/evm-bridge.scss';
</style>
