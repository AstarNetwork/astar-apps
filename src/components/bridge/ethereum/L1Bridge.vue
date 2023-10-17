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
          <img width="24" :src="zkBridgeIcon[fromChainName]" alt="chain-icon" />
          <div class="column--chain">
            <div>
              <span class="text--title">{{ fromChainName }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="row--reverse">
        <button
          class="icon--reverse cursor-pointer"
          @click="() => reverseChain(fromChainName, toChainName)"
        >
          <astar-icon-sync size="20" />
        </button>
      </div>
      <div class="box--input-field">
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
          <img width="24" :src="zkBridgeIcon[toChainName]" alt="chain-icon" />
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
              <img
                v-if="selectedToken.symbol == 'ETH'"
                width="24"
                alt="token-logo"
                :src="zkBridgeIcon[EthBridgeNetworkName.Sepolia]"
              />
              <jazzicon v-else :address="selectedToken.name" :diameter="24" class="item-logo" />
            </div>
            <span class="text--title">{{ selectedToken.symbol }}</span>
            <!-- Memo: use this incase we need to bridge more tokens -->
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
              placeholder="0.0"
              class="input--amount input--no-spin"
              @input="(e) => inputHandler(e)"
            />
          </div>
        </div>
      </div>

      <div v-if="errMsg && currentAccount" class="row--box-error">
        <span class="color--white"> {{ $t(errMsg) }}</span>
      </div>
      <div class="wrapper__row--button" :class="!errMsg && 'btn-margin-adjuster'">
        <astar-button
          v-if="isApproved"
          class="button--confirm btn-size-adjust"
          :disabled="isDisabledBridge"
          @click="bridge"
        >
          {{ $t('confirm') }}
        </astar-button>
        <astar-button
          v-else-if="isApproving"
          class="button--confirm btn-size-adjust"
          :disabled="true"
        >
          {{ $t('approving') }}
        </astar-button>
        <astar-button
          v-else
          class="button--confirm btn-size-adjust"
          :disabled="isDisabledBridge"
          @click="approve"
        >
          {{ $t('approve') }}
        </astar-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { wait } from '@astar-network/astar-sdk-core';
import { isHex } from '@polkadot/util';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { useAccount } from 'src/hooks';
import { EthBridgeNetworkName, ZkToken, zkBridgeIcon } from 'src/modules/zk-evm-bridge';
import { PropType, defineComponent, ref } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';

export default defineComponent({
  components: {
    TokenBalance,
    [Jazzicon.name]: Jazzicon,
  },
  props: {
    fetchUserHistory: {
      type: Function,
      required: true,
    },
    setIsBridge: {
      type: Function,
      required: true,
    },
    setRightUi: {
      type: Function,
      required: true,
    },
    selectedToken: {
      type: Object as PropType<ZkToken>,
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
    isDisabledBridge: {
      type: Boolean,
      required: true,
    },
    isApproved: {
      type: Boolean,
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
    nativeTokenSymbol: {
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
  },
  setup(props) {
    const { currentAccount } = useAccount();
    const isApproving = ref<boolean>(false);

    const bridge = async (): Promise<void> => {
      const transactionHash = await props.handleBridge();
      const isTransactionSuccessful = isHex(transactionHash);
      if (isTransactionSuccessful) {
        // Memo: gives some time for updating in the bridge API
        await wait(3 * 1000);
        await props.fetchUserHistory();
        props.setIsBridge(false);
      }
    };

    const approve = async (): Promise<void> => {
      const transactionHash = await props.handleApprove();
      const isTransactionSuccessful = isHex(transactionHash);
      if (isTransactionSuccessful) {
        isApproving.value = true;
      }
    };

    return {
      zkBridgeIcon,
      currentAccount,
      EthBridgeNetworkName,
      isApproving,
      bridge,
      approve,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/ethereum/styles/l1-bridge.scss';
</style>