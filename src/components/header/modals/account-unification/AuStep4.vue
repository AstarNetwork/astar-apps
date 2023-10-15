<template>
  <div class="wrapper--account-unification">
    <p class="text">{{ $t('wallet.unifiedAccount.balanceTransferred') }}</p>
    <div class="list--evm-tokens">
      <div v-for="t in transferXc20Tokens" :key="t.assetId" class="row">
        <div class="column--icon">
          <jazzicon
            v-if="t.tokenImage.includes('custom-token')"
            :address="t.assetId"
            :diameter="24"
          />
          <img v-else :src="t.tokenImage" alt="logo" />
        </div>
        <div class="column--name">
          <span class="symbol">{{ t.symbol }}</span>
          <span class="name">{{ t.name }}</span>
        </div>
        <div class="column--balance">
          <span class="token">
            {{
              $t('amountToken', {
                amount: t.formattedBalance,
                token: t.symbol,
              })
            }}
          </span>
        </div>
      </div>
    </div>

    <!-- Action -->
    <div>
      <astar-button :disabled="isSendingXc20Tokens" class="btn" @click="transferTokens">
        {{ isSendingXc20Tokens ? $t('assets.syncing') : $t('assets.transfer') }}
      </astar-button>
    </div>
  </div>
</template>

<script lang="ts">
import { TransferXc20Token } from 'src/hooks';
import { defineComponent, PropType } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';

export default defineComponent({
  components: { [Jazzicon.name]: Jazzicon },
  props: {
    transferXc20Tokens: {
      type: Object as PropType<TransferXc20Token[]>,
      required: true,
    },
    handleTransferXc20Tokens: {
      type: Function,
      required: true,
    },
    isSendingXc20Tokens: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['next'],
  setup(props, { emit }) {
    const next = (): void => {
      emit('next');
    };

    const transferTokens = async (): Promise<void> => {
      await props.handleTransferXc20Tokens();
      if (props.transferXc20Tokens.length === 0) {
        next();
      }
    };

    return {
      transferTokens,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account-unification.scss';
</style>
