<template>
  <div class="wrapper--account-unification">
    <p class="text">
      Now xcTokens are sent and you are ready to unify both accounts! Please check below before
      confirm.
    </p>

    <div class="created-unified-account">
      <div>
        <!-- Todo: check the account's NFT image -->
        <!-- <img :src="icon_img.astar_gradient" class="icon" /> -->
        <jazzicon :address="currentAccount" :diameter="80" class="icon" />
      </div>
      <div class="name">{{ accountName }}</div>
      <div>
        <div class="native-account">
          <img v-if="iconWallet" width="24" :src="iconWallet" alt="wallet-icon" />
          <div class="column--account">
            <span class="text--title">{{ currentAccountName }}</span>
            <span class="text--title">{{ getShortenAddress(currentAccount, 10) }}</span>
          </div>
        </div>
        <div class="evm-account">
          <img width="24" :src="require('/src/assets/img/metamask.png')" alt="wallet-icon" />
          <span class="text--title">{{ getShortenAddress(selectedEvmAddress, 10) }}</span>
        </div>
      </div>
    </div>

    <!-- Action -->
    <div>
      <astar-button class="btn" @click="next()">Submit</astar-button>
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
