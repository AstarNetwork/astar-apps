<template>
  <div>
    <div class="container">
      <div class="widget">
        <div class="row">
          <div class="currency">
            <div class="label">{{ $t('from') }}</div>
            <div class="chain">
              <div>Logo</div>
              <div class="chain-name">Ethereum</div>
              <div>▼</div>
            </div>
          </div>
          <div>
            <div class="input-row">
              <input />
              <div class="max-button">{{ $t('bridge.max') }}</div>
              <div class="token-selector">
                <div></div>
                <div>token</div>
                <div>▼</div>
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
            <div class="chain">
              <div>Logo</div>
              <div class="chain-name">Astar</div>
              <div>▼</div>
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
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
    // ModalConnectWallet,
    // ModalInstallWallet,
    // ModalAccount,
  },
  setup() {
    useMeta({ title: 'EVM Bridge' });

    return {};
  },
});
</script>

<style lang="scss" scoped>
@import './styles/evm-bridge.scss';
</style>
