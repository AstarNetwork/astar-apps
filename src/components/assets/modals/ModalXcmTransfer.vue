<template>
  <astar-simple-modal
    :show="isModalXcmTransfer"
    :title="$t('assets.modals.transfer')"
    :is-closing="isClosingModal"
    @close="closeModal"
  >
    <div v-if="token" class="wrapper--modal">
      <div class="rows">
        <div class="box--input">
          <div class="box__space-between">
            <span> {{ $t('from') }}</span>
            <div />
          </div>
          <div class="box__row">
            <img v-if="iconWallet" width="24" :src="iconWallet" alt="wallet-icon" />
            <div class="column--wallet-address">
              <div class="column--wallet-name">
                <span class="text--title">{{ currentAccountName }}</span>
              </div>
              <span class="text--title">{{ getShortenAddress(currentAccount) }}</span>
            </div>
          </div>
        </div>
        <div class="box--input box--hover--active">
          <div class="box__space-between">
            <span> {{ $t('to') }}</span>
            <div>
              <span class="text--to--balance">
                {{
                  $t('assets.modals.balance', {
                    amount: $n(truncate(toAddressBalance)),
                    token: String(token.metadata.symbol),
                  })
                }}
              </span>
            </div>
          </div>
          <modal-select-account
            v-model:selAddress="toAddress"
            :to-address="toAddress"
            :is-erc20-transfer="false"
          />
        </div>

        <div class="box--input box--hover--active">
          <div class="box__space-between">
            <div />
            <div class="box__available">
              <span class="text--available">
                {{
                  $t('assets.modals.balance', {
                    amount: $n(truncate(token.userBalance)),
                    token: String(token.metadata.symbol),
                  })
                }}</span
              >
              <button class="btn--max" @click="toMaxAmount">
                {{ $t('assets.modals.max') }}
              </button>
            </div>
          </div>
          <div class="box__row">
            <div class="box__row">
              <img width="24" alt="token-logo" :src="tokenImage" />
              <span class="text--title">{{ String(token.metadata.symbol) }}</span>
            </div>
            <div class="box__column--input-amount">
              <input
                :value="transferAmt"
                inputmode="decimal"
                type="number"
                min="0"
                pattern="^[0-9]*(\.)?[0-9]*$"
                placeholder="0.0"
                class="input--amount input--no-spin"
                @input="inputHandler"
              />
            </div>
          </div>
        </div>

        <SpeedConfiguration
          :gas-cost="nativeTipPrice"
          :selected-gas="selectedTip"
          :set-selected-gas="setSelectedTip"
        />

        <div v-if="errMsg && toAddress" class="rows__row--error">
          <span class="text--error">{{ errMsg }}</span>
        </div>
      </div>
      <div class="wrapper__row--button">
        <button class="btn btn--confirm" :disabled="isDisabledTransfer" @click="transfer">
          {{ $t('confirm') }}
        </button>
      </div>
    </div>
  </astar-simple-modal>
</template>
<script lang="ts">
import { fadeDuration } from '@astar-network/astar-ui';
import {
  ChainAsset,
  useAccount,
  useWalletIcon,
  useXcmTokenDetails,
  useXcmTokenTransfer,
} from 'src/hooks';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import { wait } from 'src/hooks/helper/common';
import { useStore } from 'src/store';
import { computed, defineComponent, PropType, ref, watchEffect } from 'vue';
import ModalSelectAccount from './ModalSelectAccount.vue';
import SpeedConfiguration from 'src/components/common/SpeedConfiguration.vue';
import { truncate } from 'src/hooks/helper/common';

export default defineComponent({
  components: { ModalSelectAccount, SpeedConfiguration },
  props: {
    isModalXcmTransfer: {
      type: Boolean,
      required: false,
      default: false,
    },
    handleModalXcmTransfer: {
      type: Function,
      required: true,
    },
    accountData: {
      type: Object,
      required: false,
      default: null,
    },
    token: {
      type: (Object as PropType<ChainAsset>) || null,
      required: false,
      default: null,
    },
    handleUpdateXcmTokenBalances: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const { iconWallet } = useWalletIcon();
    const store = useStore();
    const { currentAccount, currentAccountName } = useAccount();
    const token = computed(() => props.token);
    const { tokenImage } = useXcmTokenDetails(token);

    const nativeTokenSymbol = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return 1 ? chainInfo.tokenSymbol : '';
    });

    const {
      selectedTip,
      nativeTipPrice,
      transferAmt,
      toAddressBalance,
      fromAddressBalance,
      toAddress,
      errMsg,
      isDisabledTransfer,
      inputHandler,
      setSelectedTip,
      resetStates,
      transferAsset,
      toMaxAmount,
    } = useXcmTokenTransfer(token);

    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      resetStates();
      await Promise.all([wait(fadeDuration), props.handleUpdateXcmTokenBalances()]);
      props.handleModalXcmTransfer({ isOpen: false, currency: null });
      isClosingModal.value = false;
    };

    const transfer = async (): Promise<void> => {
      await transferAsset({
        transferAmt: Number(transferAmt.value),
        toAddress: toAddress.value,
        finalizeCallback: closeModal,
      });
    };

    return {
      iconWallet,
      currentAccount,
      currentAccountName,
      nativeTokenSymbol,
      toAddress,
      toAddressBalance,
      fromAddressBalance,
      transferAmt,
      errMsg,
      isClosingModal,
      isDisabledTransfer,
      tokenImage,
      selectedTip,
      nativeTipPrice,
      setSelectedTip,
      transfer,
      toMaxAmount,
      closeModal,
      getShortenAddress,
      inputHandler,
      truncate,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-transfer.scss';
</style>
