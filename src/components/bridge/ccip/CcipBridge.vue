<template>
  <div class="wrapper--ccip-bridge">
    <div class="rows">
      <div
        class="box--input-field cursor-pointer box--hover--active"
        @click="setRightUi('select-chain', 'from')"
      >
        <div class="box__space-between">
          <span> {{ $t('from') }}</span>
          <div>
            <span class="text--to--balance">
              <token-balance
                text="assets.modals.balance"
                :balance="String(fromBridgeBalance)"
                :symbol="selectedToken.symbol"
              />
            </span>
          </div>
        </div>
        <div class="box__row">
          <img width="24" :src="ccipBridgeIcon[fromChainName]" alt="chain-icon" />
          <div class="column--chain">
            <div>
              <span class="text--title">{{ fromChainName }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="isEnabledWithdrawal" class="row--reverse">
        <button class="icon--reverse cursor-pointer" @click="() => reverseChain()">
          <astar-icon-sync size="20" />
        </button>
      </div>
      <div v-else class="row--reverse">
        <button class="icon--reverse" disabled>
          <astar-icon-sync size="20" />
        </button>
        <q-tooltip>
          <span class="text--tooltip">
            {{ $t('bridge.disabledWithdrawal', { network: fromChainName }) }}
          </span>
        </q-tooltip>
      </div>
      <div
        class="box--input-field row--reverse-bottom cursor-pointer box--hover--active"
        @click="setRightUi('select-chain', 'to')"
      >
        <div class="box__space-between">
          <span> {{ $t('to') }}</span>
          <div>
            <span class="text--to--balance">
              <token-balance
                text="assets.modals.balance"
                :balance="String(toBridgeBalance)"
                :symbol="selectedToken.symbol"
              />
            </span>
          </div>
        </div>
        <div class="box__row">
          <img width="24" :src="ccipBridgeIcon[toChainName]" alt="chain-icon" />
          <div class="column--chain">
            <div>
              <span class="text--title">{{ toChainName }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="box--input-field box--hover--active">
        <div class="box__space-between">
          <div />
          <div class="box__available">
            <span class="text--to--balance">
              <token-balance
                text="assets.modals.balance"
                :balance="String(fromBridgeBalance)"
                :symbol="selectedToken.symbol"
              />
            </span>
          </div>
        </div>
        <div class="box__row">
          <div class="box__row">
            <div class="token-logo">
              <img width="24" alt="token-logo" :src="selectedToken.image" />
            </div>
            <span class="text--title">{{ selectedToken.symbol }}</span>
          </div>
          <div class="box__column--input-amount">
            <input
              :value="bridgeAmt"
              inputmode="decimal"
              type="number"
              min="0"
              pattern="^[0-9]*(\.)?[0-9]*$"
              placeholder="0"
              class="input--amount input--no-spin"
              @input="(e) => inputHandler(e)"
            />
          </div>
        </div>
      </div>

      <div v-if="!isApproved && !isNativeToken">
        <div class="input--checkbox" :class="isApproveMaxAmount && 'input--checkbox--checked'">
          <input
            id="approve-max-amount"
            :checked="isApproveMaxAmount"
            :value="isApproveMaxAmount"
            type="checkbox"
            class="checkbox"
            @change="(event:any)=>$emit('update:isApproveMaxAmount', event.target.checked)"
          />
          <label for="approve-max-amount">
            <span>{{ $t('bridge.approvalMaxAmount') }}</span>
          </label>
        </div>
      </div>

      <div v-if="errMsg && currentAccount" class="row--box-error">
        <span class="color--white"> {{ $t(errMsg) }}</span>
      </div>

      <div class="container--warning">
        <ul>
          <li>
            {{
              $t('bridge.feeOnBridge', {
                amount: nativeToken === 'ETH' ? truncate(bridgeFee, 5) : $n(truncate(bridgeFee)),
                symbol: nativeToken,
              })
            }}
          </li>
          <li v-if="toChainName === CcipNetworkName.Soneium">
            {{ $t('bridge.rebate') }}
          </li>
          <li>
            {{ $t('bridge.warningCcipTime', { time: bridgeTime }) }}
          </li>
        </ul>
      </div>

      <div v-if="!isH160" class="row--box-error">
        <span class="color--white">
          {{ $t('bridge.warningInvalidWallet') }}
        </span>
      </div>
      <div v-else-if="!ccipBridgeEnabled" class="row--box-error">
        <span class="color--white">
          {{ $t('bridge.ccipUnderMaintenance') }}
        </span>
      </div>

      <div class="row--buttons">
        <astar-button class="button--confirm" :disabled="isApproveButtonDisabled" @click="approve">
          {{ $t('approve') }}
        </astar-button>
        <astar-button class="button--confirm" :disabled="isBridgeButtonDisabled" @click="bridge">
          {{ $t('bridge.bridge') }}
        </astar-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { truncate } from '@astar-network/astar-sdk-core';
import { isHex } from '@polkadot/util';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { EthBridgeNetworkName } from 'src/modules/zk-evm-bridge';
import { useStore } from 'src/store';
import { PropType, computed, defineComponent, ref, watch } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';
import { checkIsCcipBridgeEnabled } from 'src/features';
import {
  ccipBridgeIcon,
  CCIP_TOKEN,
  CcipNetworkName,
  ccipBridgeTime,
} from 'src/modules/ccip-bridge';

export default defineComponent({
  components: {
    TokenBalance,
    [Jazzicon.name]: Jazzicon,
  },
  props: {
    setRightUi: {
      type: Function,
      required: true,
    },
    selectedToken: {
      type: Object as PropType<CCIP_TOKEN>,
      required: true,
    },
    bridgeAmt: {
      type: String,
      required: true,
    },
    errMsg: {
      type: String,
      required: true,
    },
    loadIsApproved: {
      type: Boolean,
      required: true,
    },
    isApproved: {
      type: Boolean,
      required: true,
    },
    isGasPayable: {
      type: Boolean,
      required: true,
    },
    isApproving: {
      type: Boolean,
      required: true,
    },
    isApproveMaxAmount: {
      type: Boolean,
      required: true,
    },
    isDisabledBridge: {
      type: Boolean,
      required: true,
    },
    bridgeFee: {
      type: Number,
      required: true,
    },
    fromBridgeBalance: {
      type: Number,
      required: true,
    },
    toBridgeBalance: {
      type: Number,
      required: true,
    },
    fromChainName: {
      type: String,
      required: true,
    },
    toChainName: {
      type: String,
      required: true,
    },
    inputHandler: {
      type: Function,
      required: true,
    },
    reverseChain: {
      type: Function,
      required: true,
    },
    handleBridge: {
      type: Function,
      required: true,
    },
    handleApprove: {
      type: Function,
      required: true,
    },
    setIsApproving: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const { currentAccount } = useAccount();
    const { nativeTokenSymbol, isShibuyaEvm, isAstarEvm, isH160 } = useNetworkInfo();
    const store = useStore();
    const isHandling = ref<boolean>(false);
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
    const isEnabledWithdrawal = computed<boolean>(() => true);

    const ccipBridgeEnabled = computed<boolean>(() => {
      return checkIsCcipBridgeEnabled({
        from: props.fromChainName as CcipNetworkName,
        to: props.toChainName as CcipNetworkName,
      });
    });

    const isApproveButtonDisabled = computed<boolean>(() =>
      Boolean(
        props.isApproved ||
          props.isDisabledBridge ||
          props.loadIsApproved ||
          isHandling.value ||
          isLoading.value ||
          !ccipBridgeEnabled.value
      )
    );

    const isBridgeButtonDisabled = computed<boolean>(() =>
      Boolean(
        !props.isApproved ||
          props.isDisabledBridge ||
          isHandling.value ||
          isLoading.value ||
          !ccipBridgeEnabled.value ||
          !props.isGasPayable
      )
    );

    const nativeToken = computed<string>(() => {
      if (
        props.fromChainName === CcipNetworkName.SoneiumMinato ||
        props.fromChainName === CcipNetworkName.Soneium
      ) {
        return 'ETH';
      } else {
        return nativeTokenSymbol.value;
      }
    });

    const isNativeToken = computed<boolean>(() => {
      return props.selectedToken.symbol === nativeToken.value;
    });

    const bridge = async (): Promise<void> => {
      isHandling.value = true;
      const transactionHash = await props.handleBridge();
      const isTransactionSuccessful = isHex(transactionHash);
      if (isTransactionSuccessful) {
        store.commit('general/setLoading', false, { root: true });
      }
      isHandling.value = false;
    };

    const approve = async (): Promise<void> => {
      isHandling.value = true;
      const transactionHash = await props.handleApprove();
      const isTransactionSuccessful = isHex(transactionHash);
      if (isTransactionSuccessful) {
        store.commit('general/setLoading', true, { root: true });
        props.setIsApproving(true);
      }
      isHandling.value = false;
    };

    const bridgeTime = computed<number>(
      () =>
        ccipBridgeTime[props.fromChainName as CcipNetworkName][props.toChainName as CcipNetworkName]
    );

    watch(
      [props],
      () => {
        if (props.isApproved) {
          props.setIsApproving(false);
          store.commit('general/setLoading', false, { root: true });
        }
      },
      { immediate: false }
    );

    return {
      ccipBridgeIcon,
      currentAccount,
      EthBridgeNetworkName,
      isHandling,
      isLoading,
      isNativeToken,
      isEnabledWithdrawal,
      nativeToken,
      ccipBridgeEnabled,
      bridgeTime,
      isApproveButtonDisabled,
      isBridgeButtonDisabled,
      isH160,
      CcipNetworkName,
      truncate,
      bridge,
      approve,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/ccip/styles/ccip-bridge.scss';
</style>
