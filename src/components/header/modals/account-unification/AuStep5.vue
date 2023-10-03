<template>
  <div class="wrapper--account-unification">
    <p class="text">
      {{ $t('wallet.unifiedAccount.readyToUnify') }}
    </p>

    <div class="wrapper--unified-account">
      <div>
        <!-- Todo: check the account's NFT image -->
        <jazzicon :address="currentAccount" :diameter="80" class="icon--unified-account" />
      </div>
      <div class="text--unified-account">{{ accountName }}</div>
      <div class="box--wallet-list">
        <div class="row--wallet">
          <div class="column--icon">
            <img v-if="iconWallet" width="24" :src="iconWallet" alt="wallet-icon" />
          </div>
          <div class="column--address">
            <div class="text--accent">{{ currentAccountName }}</div>
            <div>{{ getShortenAddress(currentAccount, 10) }}</div>
          </div>
        </div>
        <div class="row--wallet">
          <div class="column--icon">
            <img width="24" :src="require('/src/assets/img/metamask.png')" alt="wallet-icon" />
          </div>
          <div>{{ getShortenAddress(selectedEvmAddress, 10) }}</div>
        </div>
      </div>
    </div>

    <!-- Action -->
    <div>
      <astar-button :disabled="isBusy" class="btn" @click="next()">
        {{ $t('dappStaking.modals.submit') }}
      </astar-button>
    </div>
  </div>
</template>

<script lang="ts">
import { useAccount, useWalletIcon } from 'src/hooks';
import { defineComponent } from 'vue';
import { getShortenAddress } from '@astar-network/astar-sdk-core';
import Jazzicon from 'vue3-jazzicon/src/components';

export default defineComponent({
  components: { [Jazzicon.name]: Jazzicon },
  props: {
    selectedEvmAddress: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    isBusy: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['next'],
  setup(props, { emit }) {
    const next = () => {
      emit('next');
    };
    const { currentAccount, currentAccountName } = useAccount();
    const { iconWallet } = useWalletIcon();

    return {
      currentAccount,
      currentAccountName,
      iconWallet,
      getShortenAddress,
      next,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account-unification.scss';
</style>
