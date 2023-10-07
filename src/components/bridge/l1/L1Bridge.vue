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
                :symbol="nativeTokenSymbol"
              />
            </span>
          </div>
        </div>
        <div class="box__row">
          <img width="24" :src="icon[fromChainName]" alt="chain-icon" />
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
                :symbol="nativeTokenSymbol"
              />
            </span>
          </div>
        </div>
        <div class="box__row">
          <img width="24" :src="icon[toChainName]" alt="chain-icon" />
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
                symbol="ETH"
              />
            </span>
          </div>
        </div>
        <div class="box__row">
          <div class="box__row cursor-pointer">
            <div class="token-logo">
              <img width="24" alt="token-logo" :src="icon[BridgeNetworkName.Sepolia]" />
            </div>
            <span class="text--title">ETH</span>
            <!-- Memo: use this incase we need to bridge more tokens -->
            <!-- <div class="icon--expand">
              <astar-icon-expand size="20" />
            </div> -->
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

      <div v-if="errMsg && currentAccount" class="row--box-error">
        <span class="color--white"> {{ $t(errMsg) }}</span>
      </div>
      <div class="wrapper__row--button" :class="!errMsg && 'btn-margin-adjuster'">
        <astar-button
          class="button--confirm btn-size-adjust"
          :disabled="isDisabledBridge"
          @click="handleBridge"
        >
          {{ $t('confirm') }}
        </astar-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { useAccount, useL1Bridge, BridgeNetworkName } from 'src/hooks';
import { useStore } from 'src/store';
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
    TokenBalance,
  },
  setup(props) {
    const { currentAccount } = useAccount();
    const {
      transferAmt,
      errMsg,
      isDisabledBridge,
      fromBridgeBalance,
      toBridgeBalance,
      fromChainName,
      toChainName,
      nativeTokenSymbol,
      inputHandler,
      reverseChain,
      handleBridge,
    } = useL1Bridge();

    const store = useStore();

    const icon = {
      [BridgeNetworkName.Sepolia]: require('/src/assets/img/ethereum.png'),
      [BridgeNetworkName.Akiba]: require('src/assets/img/chain/shibuya.png'),
    } as any;

    return {
      icon,
      currentAccount,
      transferAmt,
      isDisabledBridge,
      errMsg,
      fromBridgeBalance,
      toBridgeBalance,
      fromChainName,
      toChainName,
      BridgeNetworkName,
      nativeTokenSymbol,
      inputHandler,
      reverseChain,
      handleBridge,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/l1/styles/l1-bridge.scss';
</style>
