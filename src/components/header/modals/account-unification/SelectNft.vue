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
    </div>
    <div v-if="ownedNfts.length === 0 && !isBusy" class="item">
      {{ $t('wallet.unifiedAccount.noNfts') }}
    </div>

    <!-- Action -->
    <div>
      <astar-button class="btn" @click="next">Next</astar-button>
    </div>
  </div>
</template>

<script lang="ts">
import { useNft } from 'src/hooks/useNft';
import { NftMetadata } from 'src/v2/models';
import { defineComponent, onMounted, ref, PropType, watch } from 'vue';

export default defineComponent({
  components: {},
  props: {
    evmAddress: {
      type: String,
      required: true,
    },
    avatarMetadata: {
      type: Object as PropType<NftMetadata | undefined>,
      default: undefined,
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

    watch([ownedNfts], () => {
      selectedIndex.value = ownedNfts.value.findIndex(
        (nft) =>
          nft.contractAddress === props.avatarMetadata?.contractAddress &&
          nft.tokenId === props.avatarMetadata?.tokenId
      );
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
