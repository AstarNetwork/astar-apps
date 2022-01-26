<template>
  <div>
    <div class="container">
      <div class="widget">
        <div class="row">
          <div class="currency">
            <div class="label">{{ $t('from') }}</div>
            <div class="chain" @click="openModal('src')">
              <div>
                <img v-if="srcChain" :src="srcChain.icon" alt="src-chain-logo" class="chain-logo" />
              </div>
              <div v-if="srcChain" class="chain-name">
                {{ srcChain ? getChainName(srcChain.id) : '' }}
              </div>
              <div class="under-arrow">▼</div>
            </div>
          </div>
          <div>
            <div class="input-row">
              <input />
              <div class="max-button">{{ $t('bridge.max') }}</div>
              <div class="token-selector" @click="openModal('token')">
                <div></div>
                <div>token</div>
                <div class="under-arrow">▼</div>
              </div>
            </div>
            <div class="information label">
              <div>$0.00</div>
              <div class="balance">
                <div>{{ $t('bridge.balance') }}</div>
                <div>0.1234 ETH</div>
              </div>
            </div>
          </div>
        </div>
        <div class="reverse">
          <div class="reverse-button">↑↓</div>
        </div>
        <div class="row">
          <div class="currency">
            <div class="label">{{ $t('to') }}</div>
            <div class="chain" @click="openModal('dest')">
              <div>
                <img
                  v-if="destChain"
                  :src="destChain.icon"
                  alt="destChain-chain-logo"
                  class="chain-logo"
                />
              </div>
              <div class="chain-name">{{ destChain ? getChainName(destChain.id) : '' }}</div>
              <div class="under-arrow">▼</div>
            </div>
          </div>
          <div>
            <div class="estimation-row">
              <div class="label">{{ $t('estimated') }}</div>
              <div class="estimated-value">123.456789123445</div>
            </div>
            <div class="label">$0.00</div>
          </div>
        </div>
        <div class="bridge-button">{{ $t('bridge.connectEvmWallet') }}</div>
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

      <ModalChain
        v-if="modal === 'src'"
        v-model:isOpen="modal"
        :close-modal="closeModal"
        :select-chain="selectChain"
        :chains="srcChains"
        :modal="modal"
      />

      <ModalChain
        v-if="modal === 'dest'"
        v-model:isOpen="modal"
        :close-modal="closeModal"
        :select-chain="selectChain"
        :chains="destChains"
        :modal="modal"
      />
      <!-- <div class="connect-wallet" @click="openSelectModal">
        {{ $t('wallet.connectWallet') }}
      </div> -->
    </div>

    <!-- <modal-connect-wallet
      v-if="modalName === WalletModalOption.SelectWallet"
      :set-wallet-modal="setWalletModal"
      :set-close-modal="setCloseModal"
    />

    <ModalInstallWallet
      v-if="modalName === WalletModalOption.NoExtension"
      :set-close-modal="setCloseModal"
      :selected-wallet="selectedWallet"
    /> -->
  </div>
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import { useCbridge } from 'src/hooks';
import { defineComponent } from 'vue';
import { getChainName } from 'src/c-bridge';
import ModalChain from './modals/ModalChain.vue';

export default defineComponent({
  components: {
    // ModalConnectWallet,
    // ModalInstallWallet,
    // ModalAccount,
    ModalChain,
  },
  setup() {
    useMeta({ title: 'EVM Bridge' });
    const {
      srcChain,
      destChain,
      chains,
      closeModal,
      openModal,
      modal,
      destChains,
      srcChains,
      selectChain,
    } = useCbridge();

    return {
      srcChain,
      destChain,
      chains,
      closeModal,
      openModal,
      modal,
      destChains,
      srcChains,
      selectChain,
      getChainName,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/evm-bridge.scss';
</style>
