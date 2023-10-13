<template>
  <div class="wrapper--account-unification">
    <div class="list--nfts">
      <div
        v-for="(nft, index) in ownedNfts"
        :key="`nft-${index}`"
        class="item"
        :class="selectedIndex === index && 'item--selected'"
        @click="selectedIndex = index"
      >
        <img :src="nft.image" :alt="nft.name" />
      </div>
      <div v-if="ownedNfts.length === 0 && !isBusy" class="item">
        You don't have NFTs minted at the moment. When you mint some you will be able to update your
        unified account with a NFT. For the moment default icon will be used.
      </div>
    </div>

    <!-- Action -->
    <div>
      <astar-button class="btn" @click="next">Next</astar-button>
    </div>
  </div>
</template>

<script lang="ts">
import { useNft } from 'src/hooks/useNft';
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  components: {},
  props: {
    evmAddress: {
      type: String,
      required: true,
    },
  },
  emits: ['next'],
  setup(props, { emit }) {
    const { ownedNfts, isBusy, getOwnedNfts } = useNft();
    const selectedIndex = ref<number>(-1);

    const next = () => {
      if (selectedIndex.value > -1) {
        emit('next', ownedNfts.value[selectedIndex.value]);
      } else {
        emit('next');
      }
    };

    onMounted(() => {
      getOwnedNfts(props.evmAddress);
    });

    return {
      ownedNfts,
      selectedIndex,
      isBusy,
      next,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account-unification.scss';
</style>
