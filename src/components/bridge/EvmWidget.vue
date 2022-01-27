<template>
  <div>
    <div class="container">
      <div class="widget">
        <div class="row">
          <div class="currency">
            <span class="label">{{ $t('from') }}</span>
            <div class="chain" @click="openModal('src')">
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
            <div class="input-row">
              <input />
              <div class="max-button">{{ $t('bridge.max') }}</div>
              <div class="token-selector" @click="openModal('token')">
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
              <span>$0.00</span>
              <div class="balance">
                <p>{{ $t('bridge.balance') }}</p>
                <p>0.1234 ETH</p>
              </div>
            </div>
          </div>
        </div>
        <div class="reverse" @click="reverseChain">
          <span class="reverse-button">↑↓</span>
        </div>
        <div class="row">
          <div class="currency">
            <span class="label">{{ $t('to') }}</span>
            <div class="chain" @click="openModal('dest')">
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
            <div class="estimation-row">
              <span class="label">{{ $t('estimated') }}</span>
              <span class="estimated-value">123.456789123445</span>
            </div>
            <span class="label">$0.00</span>
          </div>
        </div>
        <div v-if="!isH160" class="bridge-button" @click="openSelectModal">
          {{ $t('bridge.connectEvmWallet') }}
        </div>
        <div v-else class="bridge-button">
          {{ $t('bridge.bridge') }}
        </div>
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
        :src-chain-id="srcChainId"
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
import { useCbridge, useConnectWallet } from 'src/hooks';
import { defineComponent } from 'vue';
import ModalChain from './modals/ModalChain.vue';
import ModalToken from './modals/ModalToken.vue';
import { getChainName } from 'src/c-bridge';

import ModalConnectWallet from '../balance/modals/ModalConnectWallet.vue';
import ModalInstallWallet from '../balance/modals/ModalInstallWallet.vue';

export default defineComponent({
  components: {
    ModalChain,
    ModalToken,
    ModalConnectWallet,
    ModalInstallWallet,
  },
  setup() {
    useMeta({ title: 'EVM Bridge' });

    const {
      srcChain,
      destChain,
      srcChains,
      destChains,
      chains,
      tokens,
      modal,
      selectedToken,
      closeModal,
      openModal,
      selectChain,
      selectToken,
      reverseChain,
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
      srcChain,
      destChain,
      chains,
      tokens,
      modal,
      destChains,
      srcChains,
      selectedToken,
      logoUsdt,
      closeModal,
      openModal,
      selectChain,
      selectToken,
      reverseChain,
      WalletModalOption,
      modalConnectWallet,
      walletModalName,
      selectedWallet,
      isH160,
      closeWalletModal,
      setWalletModal,
      openSelectModal,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/evm-bridge.scss';
</style>
