<template>
  <div class="wrapper--l1-bridge">
    <div class="rows">
      <div class="box--input-field">
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
          <img width="24" :src="lzBridgeIcon[fromChainName]" alt="chain-icon" />
          <div class="column--chain">
            <div>
              <span class="text--title">{{ fromChainName }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="isEnabledWithdrawal" class="row--reverse">
        <button
          class="icon--reverse cursor-pointer"
          @click="() => reverseChain(fromChainName, toChainName)"
        >
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
      <div class="box--input-field row--reverse-bottom">
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
          <img width="24" :src="lzBridgeIcon[toChainName]" alt="chain-icon" />
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
          <div class="box__row cursor-pointer" @click="setRightUi('select-token')">
            <div class="token-logo">
              <img width="24" alt="token-logo" :src="selectedToken.image" />
            </div>
            <span class="text--title">{{ selectedToken.symbol }}</span>
            <div class="icon--expand">
              <astar-icon-expand size="20" />
            </div>
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
          <li>{{ $t('bridge.slippage', { percent: LayerZeroSlippage }) }}</li>
          <li>
            {{
              $t('bridge.feeOnTransaction', {
                amount:
                  nativeTokenSymbol === 'ASTR' ? $n(truncate(transactionFee, 4)) : transactionFee,
                symbol: nativeTokenSymbol,
              })
            }}
          </li>
          <li>{{ $t('bridge.warningLzWithdrawal') }}</li>
        </ul>
      </div>

      <div v-if="!layerZeroBridgeEnabled" class="row--box-error">
        <span class="color--white">
          {{ $t('bridge.underMaintenance') }}
        </span>
      </div>

      <div class="row--buttons">
        <astar-button
          class="button--confirm"
          :disabled="
            isApproved || isDisabledBridge || isHandling || isLoading || !layerZeroBridgeEnabled
          "
          @click="approve"
        >
          {{ $t('approve') }}
        </astar-button>
        <astar-button
          class="button--confirm"
          :disabled="
            !isApproved || isDisabledBridge || isHandling || isLoading || !layerZeroBridgeEnabled
          "
          @click="bridge"
        >
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
import { useAccount } from 'src/hooks';
import { EthBridgeNetworkName, LayerZeroToken, lzBridgeIcon } from 'src/modules/zk-evm-bridge';
import { useStore } from 'src/store';
import { PropType, computed, defineComponent, ref, watch } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';
import { LayerZeroNetworkName, LayerZeroSlippage } from '../../../modules/zk-evm-bridge/layerzero';
import { layerZeroBridgeEnabled } from 'src/features';

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
      type: Object as PropType<LayerZeroToken>,
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
    isApproved: {
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
    transactionFee: {
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
    const nativeTokenSymbol = computed<string>(() => {
      return props.fromChainName === LayerZeroNetworkName.AstarEvm ? 'ASTR' : 'ETH';
    });
    const store = useStore();
    const isHandling = ref<boolean>(false);
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
    const isEnabledWithdrawal = computed<boolean>(() => false);

    const isNativeToken = computed<boolean>(() => {
      return (
        props.fromChainName === LayerZeroNetworkName.AstarEvm &&
        props.selectedToken.symbol === 'ASTR'
      );
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
      lzBridgeIcon,
      currentAccount,
      EthBridgeNetworkName,
      isHandling,
      isLoading,
      isNativeToken,
      isEnabledWithdrawal,
      LayerZeroSlippage,
      nativeTokenSymbol,
      layerZeroBridgeEnabled,
      truncate,
      bridge,
      approve,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/layerzero/styles/lz-bridge.scss';
</style>
