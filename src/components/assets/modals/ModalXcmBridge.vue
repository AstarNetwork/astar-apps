<template>
  <astar-simple-modal
    v-if="isModalXcmBridge"
    :show="isModalXcmBridge"
    :title="$t('assets.xcm')"
    :is-closing="isClosingModal"
    @close="closeModal"
  >
    <ModalLoading v-if="isLoading" />
    <div v-if="token" class="wrapper--modal">
      <div class="row--mode-tab">
        <div
          class="box--bridge-option"
          :class="!isNativeBridge ? 'selected-bridge-option' : 'unselected-bridge-option'"
          @click="setIsNativeBridge(false)"
        >
          <span class="text--title" :class="!isNativeBridge && 'text-color--neon'">
            {{ $t('assets.modals.depositToEvm') }}
          </span>
        </div>
        <div
          class="box--bridge-option"
          :class="isNativeBridge ? 'selected-bridge-option' : 'unselected-bridge-option'"
          @click="setIsNativeBridge(true)"
        >
          <span class="text--title" :class="isNativeBridge && 'text-color--neon'">
            {{ $t('assets.modals.depositToNative') }}
          </span>
        </div>
      </div>
      <div class="rows">
        <div class="box--input-chain">
          <div class="box__space-between">
            <span> {{ $t('from') }}</span>
            <div />
          </div>
          <div class="row__chain">
            <img :src="chainIcon.src" alt="src-chain-logo" class="logo" />
            <span class="text--title"> {{ chainName.src }} </span>
          </div>
        </div>
        <div class="box--input-chain">
          <div class="box__space-between">
            <span> {{ $t('to') }}</span>
            <div />
          </div>
          <div class="row__chain">
            <img :src="chainIcon.dest" alt="dest-chain-logo" class="logo" />
            <span class="text--title"> {{ chainName.dest }} </span>
          </div>
        </div>

        <div v-if="!isNativeBridge" class="box--input box--hover--active">
          <div class="box__space-between">
            <span> {{ $t('assets.modals.evmWalletAddress') }} </span>
            <div>
              <!-- Todo -->
              <!-- <span class="text--to--balance">
                {{ $t('assets.modals.balance', { amount: $n(toAddressBalance), token: symbol }) }}
              </span> -->
            </div>
          </div>
          <ModalH160AddressInput v-model:selAddress="destEvmAddress" :to-address="destEvmAddress" />
        </div>

        <div class="box--input box--hover--active">
          <div class="box__space-between">
            <div />
            <div class="box__available">
              <span class="text--available">
                {{
                  $t('assets.modals.balance', {
                    amount: $n(truncate(formattedRelayChainBalance)),
                    token: String(token.metadata.symbol),
                  })
                }}</span
              >
              <button v-if="!isNativeToken" class="btn--max" @click="toMaxAmount">
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
            <span class="text--warning">{{ $t('assets.modals.xcmWarning.avoidRisk') }}</span>
          </div>
          <div v-click-away="setIsMobileDisplayTooltip" class="icon--help">
            <IconHelp class="icon--tooltip-xcm-warning" @click="setIsMobileDisplayTooltip" />
            <q-tooltip v-model="isDisplayTooltip" class="box--tooltip-warning">
              <div>
                <span v-if="existentialDeposit"
                  >{{
                    $t('assets.modals.xcmWarning.tooltip', {
                      amount: Number(existentialDeposit.amount),
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
import { ChainAsset, useXcmBridge } from 'src/hooks';
import { wait } from 'src/hooks/helper/common';
import { computed, defineComponent, PropType, ref } from 'vue';
import ModalH160AddressInput from './ModalH160AddressInput.vue';
import IconHelp from '/src/components/common/IconHelp.vue';
import ModalLoading from '/src/components/common/ModalLoading.vue';
import { truncate } from 'src/hooks/helper/common';
import { isMobileDevice } from 'src/hooks/helper/wallet';

export default defineComponent({
  components: { ModalH160AddressInput, IconHelp, ModalLoading },
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
    const isMobileDisplayTooltip = ref<boolean>(false);
    const token = computed(() => props.token);

    const isDisplayTooltip = computed<boolean | null>(() => {
      if (isMobileDevice) {
        return isMobileDisplayTooltip.value;
      } else {
        return null;
      }
    });

    const setIsMobileDisplayTooltip = (e: { target: { className: string } }): void => {
      if (isMobileDevice) {
        const isOpen = e.target.className.includes('icon--tooltip-xcm-warning');
        isMobileDisplayTooltip.value = isOpen;
      }
    };

    const {
      amount,
      errMsg,
      chainIcon,
      chainName,
      isDisabledBridge,
      tokenImage,
      isNativeToken,
      isNativeBridge,
      destEvmAddress,
      formattedRelayChainBalance,
      existentialDeposit,
      inputHandler,
      bridge,
      toMaxAmount,
      resetStates,
      setIsNativeBridge,
      updateRelayChainTokenBal,
    } = useXcmBridge(token);

    const isLoading = computed(() => {
      return existentialDeposit.value === null;
    });

    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      resetStates();
      await wait(fadeDuration);
      props.handleModalXcmBridge({ isOpen: false, currency: null });
      isClosingModal.value = false;
    };

    const finalizedCallback = async (): Promise<void> => {
      await Promise.all([
        closeModal(),
        props.handleUpdateXcmTokenBalances(),
        updateRelayChainTokenBal(),
      ]);
    };

    const handleBridge = async (): Promise<void> => {
      await bridge(finalizedCallback);
    };

    return {
      errMsg,
      isClosingModal,
      amount,
      chainIcon,
      chainName,
      isDisabledBridge,
      tokenImage,
      isNativeToken,
      isNativeBridge,
      destEvmAddress,
      formattedRelayChainBalance,
      existentialDeposit,
      isLoading,
      isDisplayTooltip,
      setIsMobileDisplayTooltip,
      inputHandler,
      closeModal,
      bridge,
      toMaxAmount,
      setIsNativeBridge,
      handleBridge,
      truncate,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-xcm-bridge.scss';
</style>
