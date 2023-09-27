<template>
  <div class="wrapper--account-unification">
    <p class="text">
      Now xcTokens are sent and you are ready to unify both accounts! Please check below before
      confirm.
    </p>

    <div class="created-unified-account">
      <div><img :src="icon_img.astar_gradient" class="icon" /></div>
      <div class="name">Unified Account Name</div>
      <div>
        <div class="native-account">native account info</div>
        <div class="evm-account">evm account info</div>
      </div>
    </div>

    <!-- Action -->
    <div>
      <astar-button class="btn" @click="next()">Submit</astar-button>
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

    const icon_img = {
      astar_gradient: require('/src/assets/img/astar_icon.svg'),
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
