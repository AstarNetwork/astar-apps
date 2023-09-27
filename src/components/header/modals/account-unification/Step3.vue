<template>
  <div class="wrapper--account-unification">
    <div class="unified-account-details">
      <!-- EVM Account -->
      <div>
        <div class="label">EVM Account</div>
        <div class="evm-account">
          <img :src="icon_img.metamask" class="icon" />
          <span>{{ selectedEvmAddress }}</span>
        </div>
      </div>

      <!-- Account Name -->
      <div>
        <div class="label">Account Name</div>
        <div>
          <input
            type="text"
            placeholder="Unified Account Name"
            @input="(event) => setAccountName(event)"
          />
        </div>
      </div>

      <!-- Account Icon -->
      <div>
        <div class="label">
          Account icon (EVM NFT can only be selected after creating the account)
        </div>
        <!-- TODO: open a select NFT modal -->
        <button type="button" class="account-icon">
          <!-- <img :src="icon_img.astar_gradient" class="icon" /> -->
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
