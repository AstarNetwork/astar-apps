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
                    amount: $n(toAddressBalance),
                    token: String(token.metadata.symbol),
                  })
                }}
              </span>
            </div>
          </div>
          <modal-select-account
            v-model:selAddress="toAddress"
            :to-address="toAddress"
            :is-erc20-transfer="isErc20Transfer"
          />
        </div>

        <div class="box--input box--hover--active">
          <div class="box__space-between">
            <div />
            <div class="box__available">
              <span class="text--available">
                {{
                  $t('assets.modals.balance', {
                    amount: $n(Number(token.userBalance)),
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
import { ChainAsset, useAccount, useWalletIcon, useXcmBridge } from 'src/hooks';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import { wait } from 'src/hooks/helper/common';
import { useStore } from 'src/store';
import { computed, defineComponent, PropType, ref, watchEffect } from 'vue';
import ModalSelectAccount from './ModalSelectAccount.vue';

// Todo: change the transaction logic to XCM transfer
export default defineComponent({
  components: { ModalSelectAccount },
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
  },
  setup(props) {
    const transferAmt = ref<string | null>(null);
    const toAddressBalance = ref<number>(0);
    const fromAddressBalance = ref<number>(0);
    const isErc20Transfer = ref<boolean>(false);
    const toAddress = ref<string>('');
    const errMsg = ref<string>('');
    const isChecked = ref<boolean>(false);
    const isClosingModal = ref<boolean>(false);
    const { iconWallet } = useWalletIcon();
    const store = useStore();
    const { currentAccount, currentAccountName } = useAccount();

    const nativeTokenSymbol = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo.tokenSymbol : '';
    });

    const t = computed(() => props.token);
    const { tokenImage, isNativeToken, transferAsset } = useXcmBridge(t);

    const isDisabledTransfer = computed(() => {
      const isLessAmount =
        0 >= Number(transferAmt.value) ||
        Number(props.token.userBalance) < Number(transferAmt.value);
      const noAddress = !toAddress.value;

      return errMsg.value !== '' || isLessAmount || noAddress;
    });

    const inputHandler = (event: any): void => {
      transferAmt.value = event.target.value;
      errMsg.value = '';
    };

    const resetStates = (): void => {
      transferAmt.value = '';
      toAddress.value = '';
      errMsg.value = '';
      toAddressBalance.value = 0;
    };

    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      resetStates();
      await wait(fadeDuration);
      props.handleModalXcmTransfer({ isOpen: false, currency: null });
      isClosingModal.value = false;
    };

    const toMaxAmount = async (): Promise<void> => {
      transferAmt.value = props.token.userBalance;
    };

    const transfer = async (): Promise<void> => {
      await transferAsset(Number(transferAmt.value ? transferAmt.value : 0), toAddress.value);
      closeModal();
    };

    const setErrorMsg = (): void => {
      const transferAmtRef = Number(transferAmt.value);
      const fromAccountBalance = props.token ? Number(props.token.userBalance) : 0;
      try {
        if (transferAmtRef > fromAccountBalance) {
          errMsg.value = 'Insufficient balance';
        } else {
          errMsg.value = '';
        }
      } catch (error: any) {
        errMsg.value = error.message;
      }
    };

    watchEffect(() => {
      setErrorMsg();
    });

    // watchEffect(async () => {
    //   await setToAddressBalance();
    // });

    // watchEffect(async () => {
    //   await setFromAddressBalance();
    // });

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
      isErc20Transfer,
      isNativeToken,
      isChecked,
      isClosingModal,
      isDisabledTransfer,
      tokenImage,
      transfer,
      toMaxAmount,
      closeModal,
      getShortenAddress,
      inputHandler,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-transfer.scss';
</style>
