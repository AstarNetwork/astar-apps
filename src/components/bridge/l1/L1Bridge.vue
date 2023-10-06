<template>
  <div class="wrapper--l1-bridge">
    <div class="rows">
      <div class="box--input-field">
        <div class="box__space-between">
          <span> {{ $t('from') }}</span>
          <div>
            <span class="text--to--balance">
              <token-balance text="assets.modals.balance" :balance="String(1)" symbol="ETH" />
            </span>
          </div>
        </div>
        <div class="box__row">
          <img width="24" :src="icon.ethereum" alt="wallet-icon" />
          <div class="column--wallet-address">
            <div class="column--from-name">
              <span class="text--title">Ethereum</span>
            </div>
          </div>
        </div>
      </div>
      <div class="row--reverse">
        <button class="icon--reverse cursor-pointer" @click="reverseChain">
          <astar-icon-sync size="20" />
        </button>
      </div>
      <div class="box--input-field box--hover--active">
        <div class="box__space-between">
          <span> {{ $t('to') }}</span>
          <div>
            <span class="text--to--balance">
              <token-balance text="assets.modals.balance" :balance="String(1)" symbol="ETH" />
            </span>
          </div>
        </div>
        <div class="box__row">
          <img width="24" :src="icon.shibuya" alt="wallet-icon" />
          <div class="column--wallet-address">
            <div class="column--wallet-name">
              <span class="text--title">Akiba</span>
            </div>
          </div>
        </div>
      </div>

      <div class="box--input-field box--hover--active">
        <div class="box__space-between">
          <div />
          <div class="box__available">
            <span class="text--to--balance">
              <token-balance text="assets.modals.balance" :balance="String(1)" symbol="ETH" />
            </span>
          </div>
        </div>
        <div class="box__row">
          <div class="box__row cursor-pointer">
            <div class="token-logo">
              <img width="24" alt="token-logo" :src="icon.ethereum" />
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
import { useAccount, useL1Bridge } from 'src/hooks';
import { useStore } from 'src/store';
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
    TokenBalance,
  },
  setup(props) {
    const { currentAccount } = useAccount();
    const { transferAmt, errMsg, isDisabledBridge, inputHandler, reverseChain, handleBridge } =
      useL1Bridge();

    const store = useStore();

    const icon = {
      ethereum: require('/src/assets/img/ethereum.png'),
      shibuya: require('src/assets/img/chain/shibuya.png'),
    };

    return {
      icon,
      currentAccount,
      transferAmt,
      isDisabledBridge,
      errMsg,
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
