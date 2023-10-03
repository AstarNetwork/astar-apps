<template>
  <div class="wrapper--account-unification">
    <div class="wrapper--au-details">
      <!-- EVM Account -->
      <div>
        <div class="label">{{ $t('assets.evmAccount') }}</div>
        <div class="box--evm-account">
          <img :src="icon_img.metamask" class="icon" />
          <span>{{ selectedEvmAddress }}</span>
        </div>
      </div>

      <!-- Account Name -->
      <div>
        <div class="label">{{ $t('wallet.unifiedAccount.unifiedAccountName') }}</div>
        <div>
          <input
            class="box--input-form"
            type="text"
            :placeholder="$t('wallet.unifiedAccount.unifiedAccountName')"
            @input="(event) => setAccountName(event)"
          />
        </div>
      </div>

      <!-- Account Icon -->
      <div>
        <div class="label">
          {{ $t('wallet.unifiedAccount.accountIcon') }}
        </div>
        <!-- TODO: open the select NFT modal (SelectNft.vue) -->
        <button type="button" class="box--account-icon">
          <jazzicon :address="currentAccount" :diameter="32" class="icon" />
        </button>
      </div>
    </div>

    <!-- Action -->
    <div>
      <astar-button
        class="btn"
        :disabled="accountName === '' || isFetchingXc20Tokens"
        @click="next()"
        >Next</astar-button
      >
    </div>
  </div>
</template>

<script lang="ts">
import { useAccount } from 'src/hooks';
import { defineComponent } from 'vue';
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
    setAccountName: {
      type: Function,
      required: true,
    },
    isFetchingXc20Tokens: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['next'],
  setup(props, { emit }) {
    const next = () => {
      emit('next');
    };

    const { currentAccount } = useAccount();

    const icon_img = {
      metamask: require('/src/assets/img/metamask.png'),
    };

    return {
      icon_img,
      currentAccount,
      next,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account-unification.scss';
</style>
