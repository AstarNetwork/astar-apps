<template>
  <div class="wrapper--account-unification">
    <!-- Connect to metamask -->
    <div class="metamask">
      <div class="metamask-info">
        <img :src="icon_img.metamask" class="icon" />
        <div>Metamask</div>
        <div v-if="isConnected" class="address">0x111122223333</div>
      </div>
      <div v-if="isConnected" class="connected">Connected</div>
      <div v-else class="connect">
        <astar-button class="btn">{{ $t('connect') }}</astar-button>
      </div>
    </div>

    <!-- Staking balance warning -->
    <div v-if="stakingBalance" class="warning">
      <div class="icon-warning">
        <astar-icon-warning />
      </div>
      <p>
        You have some Staking balance. Those staked token will not be merged to the unified account.
        Please unstake first.
      </p>
    </div>

    <!-- Actions -->
    <div v-if="stakingBalance">
      <!-- TODO: please add a function to close modal -->
      <astar-button class="btn close">Close</astar-button>
    </div>
    <div v-else>
      <astar-button class="btn" :disabled="!isConnected" @click="next()">Next</astar-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  components: {},
  emits: ['next'],
  setup(props, { emit }) {
    const next = () => {
      emit('next');
    };

    const isConnected = ref<boolean>(true);
    const stakingBalance = ref<boolean>(false);

    const icon_img = {
      metamask: require('/src/assets/img/metamask.png'),
    };

    return {
      isConnected,
      stakingBalance,
      icon_img,
      next,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account-unification.scss';
</style>
