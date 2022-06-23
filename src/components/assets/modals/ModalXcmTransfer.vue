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
              <div class="token-logo">
                <jazzicon
                  v-if="tokenImage.includes('custom-token')"
                  :address="token.id"
                  :diameter="24"
                />
                <img v-else width="24" alt="token-logo" :src="tokenImage" />
              </div>
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
      </div>
      <div class="box--warning" :class="isChecked && 'box--warning--checked'">
        <div class="input--checkbox" :class="isChecked && 'input--checkbox--checked'">
          <input id="do-not-send-to-cex" v-model="isChecked" type="checkbox" />
          <label for="do-not-send-to-cex">
            <span :class="isChecked ? 'color--gray1' : 'color--not-checked'">{{
              $t('assets.modals.notSendToExchanges')
            }}</span>
          </label>
        </div>
      </div>
      <div v-if="errMsg" class="row--box-error">
        <span class="color--white"> {{ $t(errMsg) }}</span>
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
import { computed, defineComponent, PropType, ref } from 'vue';
import ModalSelectAccount from './ModalSelectAccount.vue';
import SpeedConfiguration from 'src/components/common/SpeedConfiguration.vue';
import { truncate } from 'src/hooks/helper/common';
import Jazzicon from 'vue3-jazzicon/src/components';

export default defineComponent({
  components: { ModalSelectAccount, SpeedConfiguration, [Jazzicon.name]: Jazzicon },
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
      isChecked,
      inputHandler,
      setSelectedTip,
      resetStates,
      transferAsset,
      toMaxAmount,
    } = useXcmTokenTransfer(token);

    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      resetStates();
      await wait(fadeDuration);
      props.handleModalXcmTransfer({ isOpen: false, currency: null });
      isClosingModal.value = false;
    };

    const transfer = async (): Promise<void> => {
      const finalizeCallback = async (): Promise<void> => {
        await Promise.all([closeModal(), props.handleUpdateXcmTokenBalances()]);
      };

      await transferAsset({
        transferAmt: Number(transferAmt.value),
        toAddress: toAddress.value,
        finalizeCallback,
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
      isChecked,
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
