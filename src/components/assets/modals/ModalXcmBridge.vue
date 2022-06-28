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
          ]"
          @click="setIsNativeBridge(false)"
        >
          <span class="text--title" :class="!isNativeBridge && 'text-color--neon'">
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

        <div v-if="!isNativeBridge">
          <AddressInput
            v-model:selAddress="evmDestAddress"
            :to-address="evmDestAddress"
            :is-evm="isDeposit"
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
              <img width="24" alt="token-logo" :src="tokenImage" />
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
        <div class="row--warning">
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
                      amount: Number(existentialDeposit.relaychainMinBal),
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
import { ChainAsset, useXcmBridge, useXcmEvm, useAccount, useTooltip } from 'src/hooks';
import { wait } from 'src/hooks/helper/common';
import { computed, defineComponent, PropType, ref } from 'vue';
import AddressInput from 'src/components/common/AddressInput.vue';
import ModalLoading from '/src/components/common/ModalLoading.vue';
import ModalSelectChain from 'src/components/assets/modals/ModalSelectChain.vue';
import { truncate } from 'src/hooks/helper/common';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  components: {
    AddressInput,
    ModalSelectChain,
    ModalLoading,
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
      type: (Object as PropType<ChainAsset>) || null,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const token = computed(() => props.token);
    const { t } = useI18n();
    const { isDisplayTooltip, setIsMobileDisplayTooltip } = useTooltip('icon');

    const {
      amount,
      errMsg,
      srcChain,
      destChain,
      isDisabledBridge,
      tokenImage,
      isNativeToken,
      isNativeBridge,
      evmDestAddress,
      existentialDeposit,
      chains,
      isH160,
      evmDestAddressBalance,
      fromAddressBalance,
      isDeposit,
      inputHandler,
      bridge,
      resetStates,
      setIsNativeBridge,
      updateFromAddressBalance,
      setSrcChain,
      setDestChain,
    } = useXcmBridge(token);

    const { currentAccount } = useAccount();
    const { callAssetWithdrawToPara } = useXcmEvm(currentAccount);

    const isLoadingApi = computed<boolean>(() => {
      return existentialDeposit.value === null;
    });

    const isReady = computed<boolean>(() => {
      return !!(token.value && srcChain.value && destChain.value);
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
      tokenImage,
      isNativeToken,
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
      setIsMobileDisplayTooltip,
      inputHandler,
      closeModal,
      bridge,
      setIsNativeBridge,
      handleBridge,
      truncate,
      setSrcChain,
      setDestChain,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-xcm-bridge.scss';
</style>
