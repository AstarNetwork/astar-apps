<template>
  <div class="wrapper--account-unification">
    <!-- Connect to metamask -->
    <div class="metamask">
      <div class="metamask-info">
        <img :src="icon_img.metamask" class="icon" />
        <div>Metamask</div>
        <div v-if="selectedEvmAddress" class="address">{{ selectedEvmAddress }}</div>
      </div>
      <div v-if="selectedEvmAddress && isConnectedNetwork" class="connected">Connected</div>
      <div v-else class="connect">
        <astar-button class="btn" @click="setWeb3()">{{ $t('connect') }}</astar-button>
      </div>
    </div>

    <!-- Staking balance warning -->
    <div v-if="isStaking" class="warning">
      <div class="icon-warning">
        <astar-icon-warning />
      </div>
      <p>
        You have some Staking balance. Those staked token will not be merged to the unified account.
        Please unstake first.
      </p>
    </div>

    <div v-if="isStaking">
      <astar-button class="btn close" @click="closeModal()">Close</astar-button>
    </div>
    <div v-else>
      <astar-button
        class="btn"
        :disabled="!selectedEvmAddress || !isConnectedNetwork"
        @click="next()"
      >
        Next
      </astar-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

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
  setup(props, { emit }) {
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
