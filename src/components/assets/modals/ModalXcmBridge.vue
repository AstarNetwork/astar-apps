<template>
  <astar-simple-modal
    v-if="isModalXcmBridge"
    :show="isModalXcmBridge"
    :title="$t('assets.xcm')"
    :is-closing="isClosingModal"
    @close="closeModal"
  >
    <ModalLoading v-if="isLoadingApi" />

    <div v-if="isReady" class="wrapper--modal">
      <div class="row--mode-tab">
        <div
          :class="[
            !isNativeBridge ? 'selected-bridge-option' : 'unselected-bridge-option',
            isH160 ? 'bridge-option-evm-withdrawal' : 'box--bridge-option',
            isAstarNativeTransfer && 'option--disabled',
          ]"
          @click="!isAstarNativeTransfer && setIsNativeBridge(false)"
        >
          <span
            class="text--title"
            :class="[
              !isNativeBridge && 'text-color--neon',
              isAstarNativeTransfer && 'text-color--disabled',
            ]"
          >
            {{ $t(isH160 ? 'assets.modals.evmXcmWithdrawal' : 'assets.modals.evmXcmDeposit') }}
          </span>
        </div>
        <div
          class="box--bridge-option"
          :class="[
            isNativeBridge ? 'selected-bridge-option' : 'unselected-bridge-option',
            isH160 && 'option--disabled',
          ]"
          @click="!isH160 && setIsNativeBridge(true)"
        >
          <span
            class="text--title"
            :class="[isNativeBridge && 'text-color--neon', isH160 && 'text-color--disabled']"
          >
            {{ $t('native') }}
          </span>
        </div>
      </div>
      <div class="rows">
        <div class="box--input-chain" :class="isNativeBridge && 'box--hover--active'">
          <div class="box__space-between">
            <span> {{ $t('from') }}</span>
            <div />
          </div>
          <!-- Memo: one way bridge for 'from / to' EVM account -->
          <ModalSelectChain
            :chains="chains"
            :chain="srcChain"
            :set-chain="setSrcChain"
            :is-enable-set-chain="isNativeBridge"
          />
        </div>
        <div class="box--input-chain" :class="isNativeBridge && 'box--hover--active'">
          <div class="box__space-between">
            <span> {{ $t('to') }}</span>
            <div />
          </div>
          <ModalSelectChain
            :chains="chains"
            :chain="destChain"
            :set-chain="setDestChain"
            :is-enable-set-chain="isNativeBridge"
          />
        </div>

        <div v-if="isMoonbeamDeposit" class="box--input-chain box--hover--active">
          <div class="box__space-between">
            <span> {{ $t('assets.modals.evmWalletAddress') }}</span>
            <div />
          </div>
          <ModalSelectEvmWallet :initialize-xcm-api="initializeXcmApi" />
        </div>

        <div v-if="!isNativeBridge || isMoonbeamWithdrawal">
          <AddressInput
            v-model:selAddress="evmDestAddress"
            :to-address="evmDestAddress"
            :is-evm="isDeposit || isMoonbeamWithdrawal"
            :is-display-balance="true"
            :placeholder="evmInputPlaceholder"
            :title="evmInputTitle"
            :symbol="token.metadata.symbol"
            :address-balance="evmDestAddressBalance"
          />
          <div v-if="isH160" class="row--withdrawal-address-format">
            <a
              href="https://docs.astar.network/xcm/faq#q-where-can-i-find-my-polkadot-kusama-addresses"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="text--available">
                {{ $t('assets.modals.tipDestAddressFormat', { chain: destChain.name }) }}
              </span>
            </a>
          </div>
        </div>

        <div class="box--input box--hover--active">
          <div class="box__space-between">
            <div />
            <div class="box__available">
              <span class="text--available">
                {{
                  $t('assets.modals.balance', {
                    amount: $n(truncate(fromAddressBalance)),
                    token: String(token.metadata.symbol),
                  })
                }}
              </span>
            </div>
          </div>
          <div class="box__row">
            <div class="box__row">
              <img width="24" alt="token-logo" class="token-logo" :src="token.tokenImage" />
              <span class="text--title">{{ String(token.metadata.symbol) }}</span>
            </div>
            <div class="box__column--input-amount">
              <input
                :value="amount"
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
      </div>
      <div class="container--warning">
        <div v-if="token.isNativeToken" class="row--warning">
          <div class="column--title">
            <span class="text--dot">・</span>
            <span class="text--warning">{{ $t('assets.modals.xcmWarning.minBalIsRequired') }}</span>
          </div>
          <div
            v-click-away="setIsMobileDisplayTooltip"
            class="icon--help"
            @click="setIsMobileDisplayTooltip"
          >
            <astar-icon-help size="20" />
            <q-tooltip
              v-model="isDisplayTooltip"
              anchor="top middle"
              :self="`bottom ${$q.platform.is.mobile ? 'end' : 'middle'}`"
              class="box--tooltip"
            >
              <div>
                <span v-if="existentialDeposit"
                  >{{
                    $t('assets.modals.xcmWarning.tooltip', {
                      amount: truncate(Number(existentialDeposit.originChainMinBal), 8),
                      symbol: existentialDeposit.symbol,
                      network: existentialDeposit.chain,
                    })
                  }}
                </span>
              </div>
            </q-tooltip>
          </div>
        </div>
        <div class="row--warning">
          <div class="column--title">
            <span class="text--dot">・</span>
            <span class="text--warning">
              {{ $t('assets.modals.xcmWarning.fee') }}
            </span>
          </div>
        </div>
      </div>
      <div v-if="errMsg" class="row--box-error">
        <span class="color--white"> {{ $t(errMsg) }}</span>
      </div>
      <div class="wrapper__row--button">
        <button class="btn btn--confirm" :disabled="isDisabledBridge" @click="handleBridge">
          {{ $t('confirm') }}
        </button>
      </div>
    </div>
  </astar-simple-modal>
</template>
<script lang="ts">
import { fadeDuration } from '@astar-network/astar-ui';
import ModalSelectChain from 'src/components/assets/modals/ModalSelectChain.vue';
import ModalSelectEvmWallet from 'src/components/assets/modals/ModalSelectEvmWallet.vue';
import AddressInput from 'src/components/common/AddressInput.vue';
import { useTooltip, useXcmBridge, useXcmEvm } from 'src/hooks';
import { truncate, wait } from 'src/hooks/helper/common';
import { Asset } from 'src/v2/models';
import { computed, defineComponent, PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ModalLoading from '/src/components/common/ModalLoading.vue';

export default defineComponent({
  components: {
    AddressInput,
    ModalSelectChain,
    ModalLoading,
    ModalSelectEvmWallet,
  },
  props: {
    isModalXcmBridge: {
      type: Boolean,
      required: false,
      default: false,
    },
    handleModalXcmBridge: {
      type: Function,
      required: true,
    },
    handleUpdateXcmTokenBalances: {
      type: Function,
      required: true,
    },
    token: {
      type: (Object as PropType<Asset>) || null,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const tokenData = computed<Asset>(() => props.token);
    const { t } = useI18n();
    const { isDisplayTooltip, setIsMobileDisplayTooltip } = useTooltip('icon');

    const {
      amount,
      errMsg,
      srcChain,
      destChain,
      isDisabledBridge,
      isNativeBridge,
      evmDestAddress,
      existentialDeposit,
      chains,
      isH160,
      evmDestAddressBalance,
      fromAddressBalance,
      isDeposit,
      isLoadingApi,
      isAstarNativeTransfer,
      isMoonbeamWithdrawal,
      isMoonbeamDeposit,
      inputHandler,
      bridge,
      resetStates,
      setIsNativeBridge,
      setSrcChain,
      setDestChain,
      initializeXcmApi,
    } = useXcmBridge(tokenData);

    const { callAssetWithdrawToPara } = useXcmEvm(tokenData);

    const isReady = computed<boolean>(() => {
      return !!(tokenData.value && srcChain.value && destChain.value);
    });

    const getNetworkName = (): string => (isDeposit.value ? 'EVM' : destChain.value.name);

    const evmInputPlaceholder = computed<string>(() => {
      return t('addressPlaceholder', { network: getNetworkName() });
    });

    const evmInputTitle = computed<string>(() => {
      return t('addressFormat', { network: getNetworkName() });
    });

    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      resetStates();
      await wait(fadeDuration);
      props.handleModalXcmBridge({ isOpen: false, currency: null });
      isClosingModal.value = false;
    };

    const handleBridge = async (): Promise<void> => {
      if (isH160.value) {
        const txHash = await callAssetWithdrawToPara(
          amount.value!!,
          evmDestAddress.value,
          closeModal
        );

        if (txHash) {
          isDisabledBridge.value = true;
          amount.value = null;
        }
      } else {
        await bridge(closeModal);
        await props.handleUpdateXcmTokenBalances();
      }
    };

    return {
      errMsg,
      isClosingModal,
      amount,
      srcChain,
      destChain,
      isDisabledBridge,
      isNativeBridge,
      evmDestAddress,
      existentialDeposit,
      isLoadingApi,
      isReady,
      chains,
      evmInputPlaceholder,
      evmInputTitle,
      isH160,
      evmDestAddressBalance,
      fromAddressBalance,
      isDeposit,
      isDisplayTooltip,
      isAstarNativeTransfer,
      isMoonbeamWithdrawal,
      isMoonbeamDeposit,
      setIsMobileDisplayTooltip,
      inputHandler,
      closeModal,
      bridge,
      setIsNativeBridge,
      handleBridge,
      truncate,
      setSrcChain,
      setDestChain,
      initializeXcmApi,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-xcm-bridge.scss';
</style>
