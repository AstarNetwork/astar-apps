<template>
  <div class="wrapper--account-unification">
    <!-- Connect to metamask -->
    <div class="box--metamask">
      <div class="row--metamask">
        <img :src="icon_img.metamask" class="row--metamask__icon" />
        <div>{{ $t('metamask') }}</div>
        <div v-if="selectedEvmAddress" class="row--metamask__address">{{ selectedEvmAddress }}</div>
      </div>
      <div v-if="selectedEvmAddress && isConnectedNetwork" class="btn--connected">
        {{ $t('connected') }}
      </div>
      <div v-else class="btn--connect">
        <astar-button class="btn" @click="setWeb3()">{{ $t('connect') }}</astar-button>
      </div>
    </div>

    <!-- Staking balance warning -->
    <div v-if="isStaking && !isLoadingDappStaking" class="box--warning">
      <div class="icon--warning">
        <astar-icon-warning />
      </div>
      <p>
        {{ $t('wallet.unifiedAccount.haveStakingBalance') }}
      </p>
    </div>

    <div v-if="isStaking && !isLoadingDappStaking">
      <astar-button class="btn btn--close" @click="closeModal()">{{ $t('close') }}</astar-button>
    </div>
    <div v-else>
      <astar-button
        v-if="!isLoadingDappStaking"
        class="btn"
        :disabled="!selectedEvmAddress || !isConnectedNetwork"
        @click="next()"
      >
        {{ $t('next') }}
      </astar-button>
      <astar-button v-else class="btn" :disabled="true"> {{ $t('assets.syncing') }} </astar-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  components: {},
  props: {
    selectedEvmAddress: {
      type: String,
      required: true,
    },
    isConnectedNetwork: {
      type: Boolean,
      required: true,
    },
    isStaking: {
      type: Boolean,
      required: true,
    },
    isLoadingDappStaking: {
      type: Boolean,
      required: true,
    },
    setWeb3: {
      type: Function,
      required: true,
    },
    closeModal: {
      type: Function,
      required: true,
    },
  },
  emits: ['next'],
  setup(_, { emit }) {
    const next = (): void => {
      emit('next');
    };

    const icon_img = {
      metamask: require('/src/assets/img/metamask.png'),
    };

    return {
      icon_img,
      next,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account-unification.scss';
</style>
