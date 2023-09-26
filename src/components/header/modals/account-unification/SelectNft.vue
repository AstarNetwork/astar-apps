<template>
  <div class="wrapper--account-unification">
    <div class="nft-list">
      <div
        v-for="nft in nfts"
        :key="nft.img"
        class="item"
        :class="nft.isSelected && 'item--selected'"
      >
        <img :src="nft.img" alt="NFT" />
      </div>
    </div>

    <!-- Action -->
    <div>
      <astar-button class="btn">Next</astar-button>
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

    const nfts = [
      { img: icon_img.astar_gradient, isSelected: true },
      { img: icon_img.astar_gradient, isSelected: false },
      { img: icon_img.astar_gradient, isSelected: false },
      { img: icon_img.astar_gradient, isSelected: false },
    ];

    return {
      nfts,
      next,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account-unification.scss';
</style>
