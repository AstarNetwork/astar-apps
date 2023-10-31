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
            :maxlength="32"
            :value="accountName"
            @input="(event) => setAccountName(event)"
          />
        </div>
      </div>

      <!-- Account Icon -->
      <div>
        <div class="label">
          {{ $t('wallet.unifiedAccount.accountIcon') }}
        </div>
        <button type="button" class="box--account-icon" @click="selectNft">
          <img v-if="avatar?.image" :src="avatar.image" class="icon" />
          <jazzicon v-else :address="currentAccount" :diameter="32" class="icon" />
        </button>
      </div>
    </div>

    <!-- Action -->
    <div>
      <astar-button
        class="btn"
        :disabled="accountName === '' || isFetchingXc20Tokens || isBusy"
        @click="next()"
        >{{ isEdit ? $t('wallet.unifiedAccount.save') : $t('next') }}</astar-button
      >
    </div>
  </div>
</template>

<script lang="ts">
import { useAccount } from 'src/hooks';
import { NftMetadata } from 'src/v2/models';
import { defineComponent, ref, PropType } from 'vue';
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
    isBusy: {
      type: Boolean,
      required: true,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: Object as PropType<NftMetadata | undefined>,
      default: undefined,
    },
  },
  emits: ['next', 'onSelectNft'],
  setup(props, { emit }) {
    const next = () => {
      emit('next');
    };

    const selectNft = () => {
      emit('onSelectNft');
    };

    const { currentAccount } = useAccount();

    const icon_img = {
      metamask: require('/src/assets/img/metamask.png'),
    };

    return {
      icon_img,
      currentAccount,
      next,
      selectNft,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account-unification.scss';
</style>
