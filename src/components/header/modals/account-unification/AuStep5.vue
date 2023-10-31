<template>
  <div class="wrapper--account-unification">
    <p class="text">
      {{ $t('wallet.unifiedAccount.readyToUnify') }}
    </p>

    <div class="wrapper--unified-account">
      <div>
        <au-icon
          :native-address="currentAccount"
          :icon-url="avatarUrl"
          class="icon--unified-account"
        />
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
    <div class="box--warning">
      <div>
        <input v-model="isChecked" type="checkbox" class="checkbox" />
      </div>
      <div>{{ $t('wallet.unifiedAccount.agreeToSubmit') }}</div>
    </div>

    <!-- Action -->
    <div>
      <astar-button :disabled="isBusy || !isChecked" class="btn" @click="next()">
        {{ $t('dappStaking.modals.submit') }}
      </astar-button>
    </div>
  </div>
</template>

<script lang="ts">
import { useAccount, useWalletIcon } from 'src/hooks';
import { defineComponent, ref } from 'vue';
import { getShortenAddress } from '@astar-network/astar-sdk-core';
import AuIcon from './AuIcon.vue';

export default defineComponent({
  components: { AuIcon },
  props: {
    selectedEvmAddress: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
      required: true,
    },
    isBusy: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['next'],
  setup(_, { emit }) {
    const isChecked = ref<boolean>(false);

    const next = (): void => {
      emit('next');
    };
    const { currentAccount, currentAccountName } = useAccount();
    const { iconWallet } = useWalletIcon();

    return {
      currentAccount,
      currentAccountName,
      iconWallet,
      isChecked,
      getShortenAddress,
      next,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account-unification.scss';
</style>
