<template>
  <div v-if="srcChains" class="container animate__animated animate__fadeIn">
    <div class="widget" :class="isDarkTheme && 'widget-dark'">
      <div class="row-tool">
        <div class="tw-tooltip tw-relative">
          <icon-base
            class="tool-icon"
            :class="isPendingTx && 'rotate'"
            icon-name="history"
            @click="openModal('history')"
          >
            <q-icon :name="fasHistory" :color="isDarkTheme ? 'grey' : 'blue'" />
          </icon-base>
          <span class="tooltip">{{ $t('bridge.history') }}</span>
        </div>
      </div>
      <div class="row">
        <div class="currency">
          <span class="label">{{ $t('from') }}</span>
          <div class="chain" :class="isDarkTheme && 'chain-dark'" @click="openModal('src')">
            <img v-if="srcChain" :src="srcChain.icon" alt="src-chain-logo" class="chain-logo" />
            <span v-if="srcChain" class="chain-name">
              {{ getChainName(srcChain.id) }}
            </span>
            <span class="under-arrow">▼</span>
          </div>
        </div>
        <div v-if="selectedToken">
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
            <button
              class="max-button"
              :class="isDarkTheme && 'max-button-dark'"
              @click="toMaxAmount"
            >
              {{ $t('bridge.max') }}
            </button>
            <div
              class="token-selector"
              :class="isDarkTheme && 'token-selector-dark'"
              @click="openModal('token')"
            >
              <img
                :src="getIcon({ symbol: selectedToken.symbol, icon: selectedToken.icon })"
                alt="token-logo"
                class="token-logo"
              />
              <span>{{ selectedToken.symbol }}</span>
              <span>▼</span>
            </div>
          </div>
          <div class="information label">
            <!-- Todo: Un-comment after fix the debounce issue -->
            <!-- <span class="label"> ${{ $n(usdValue) }}</span> -->
            <div />
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
                {{ selectedToken.symbol }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="reverse" :class="isDarkTheme && 'reverse-dark'" @click="reverseChain">
        <span class="reverse-button" :class="isDarkTheme && 'reverse-button-dark'">↑↓</span>
      </div>
      <div v-if="destChain" class="row">
        <div class="currency">
          <span class="label">{{ $t('to') }}</span>
          <div class="chain" :class="isDarkTheme && 'chain-dark'" @click="openModal('dest')">
            <img
              v-if="destChain"
              :src="destChain.icon"
              alt="destChain-chain-logo"
              class="chain-logo"
            />
            <span class="chain-name">{{ getChainName(destChain.id) }}</span>
            <span class="under-arrow">▼</span>
          </div>
        </div>

        <div>
          <div class="estimation-row" :class="isDarkTheme && 'estimation-row-dark'">
            <span class="label">{{ $t('estimated') }}</span>
            <div
              v-if="amount && quotation && Number(quotation.estimated_receive_amt) > 0"
              class="estimated-input"
            >
              <span class="estimated-value">{{ quotation.estimated_receive_amt }}</span>
              <span class="estimated-value"> {{ selectedToken.symbol }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="errMsg && amount" class="err-msg-container">
        <p class="err-msg">{{ errMsg }}</p>
      </div>
      <BridgeButtons
        :bridge="bridge"
        :handle-approve="handleApprove"
        :open-select-modal="openSelectModal"
        :is-disabled-bridge="isDisabledBridge"
        :is-approval-needed="isApprovalNeeded"
        :selected-network="selectedNetwork"
        :src-chain-id="srcChain.id"
      />
    </div>

    <Remarks
      v-if="selectedToken"
      :quotation="quotation"
      :selected-token="selectedToken"
      :src-chain="srcChain"
      :dest-chain="destChain"
      :amount="Number(amount)"
    />

    <div>
      <a
        href="https://cbridge.celer.network/#/transfer"
        target="_blank"
        rel="noopener noreferrer"
        class="powered-link"
      >
        <span>Powered by</span>
        <img class="cbridge-logo" src="~assets/img/logo-cbridge.png" alt="logo-cbrige" />
        <span>cBRIDGE</span>
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

    <ModalHistory
      v-if="modal === 'history'"
      v-model:isOpen="modal"
      :close-modal="closeModal"
      :modal="modal"
      :histories="histories"
      :token-icons="tokenIcons"
      :is-updating-histories="isUpdatingHistories"
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
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import { getChainName, formatDecimals, getIcon } from 'src/c-bridge';
import { useCbridge, useConnectWallet } from 'src/hooks';
import { calUsdAmount } from 'src/hooks/helper/price';
import { useStore } from 'src/store';
import { computed, defineComponent } from 'vue';
import ModalConnectWallet from 'src/components/balance/modals/ModalConnectWallet.vue';
import ModalInstallWallet from 'src/components/balance/modals/ModalInstallWallet.vue';
import ModalChain from './modals/ModalChain.vue';
import ModalToken from './modals/ModalToken.vue';
import ModalHistory from './modals/ModalHistory.vue';
import BridgeButtons from './BridgeButtons.vue';
import Remarks from './Remarks.vue';
import { fasHistory } from '@quasar/extras/fontawesome-v5';
import IconBase from 'components/icons/IconBase.vue';

export default defineComponent({
  components: {
    ModalChain,
    ModalToken,
    ModalConnectWallet,
    ModalInstallWallet,
    BridgeButtons,
    Remarks,
    IconBase,
    ModalHistory,
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
      histories,
      isUpdatingHistories,
      isPendingTx,
      tokenIcons,
      errMsg,
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

    return {
      fasHistory,
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
      selectedNetwork,
      isDisabledBridge,
      usdValue,
      histories,
      isUpdatingHistories,
      isPendingTx,
      tokenIcons,
      errMsg,
      closeModal,
      openModal,
      selectChain,
      selectToken,
      reverseChain,
      toMaxAmount,
      bridge,
      getIcon,
      getChainName,
      formatDecimals,
      WalletModalOption,
      modalConnectWallet,
      walletModalName,
      selectedWallet,
      isH160,
      isApprovalNeeded,
      closeWalletModal,
      setWalletModal,
      openSelectModal,
      inputHandler,
      handleApprove,
      calUsdAmount,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/evm-bridge.scss';
</style>
