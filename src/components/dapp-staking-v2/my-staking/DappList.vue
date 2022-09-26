<template>
  <div class="wrapper">
    <div class="wrapper--header">
      <div class="txt--header">{{ category }}</div>
      <!-- <astar-irregular-button width="77" height="20">See All</astar-irregular-button> -->
    </div>
    <CardList :items="items" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import CardList from './components/CardList.vue';
export default defineComponent({
  components: { CardList },
  props: {
    category: {
      type: String,
      required: true,
    },
  },
  setup() {
    //TODO: need refactor as module
    let items = [
      {
        img: 'https://firebasestorage.googleapis.com/v0/b/astarnetwork-a4924.appspot.com/o/astar-dapps%2F0x1de7c3A07918fb4BE9159703e73D6e0b0736CaBC_rIb1fUz3_400x400%20(1).jpeg?alt=media&token=3832d94b-81bd-4e12-9d8b-96d83896ed3a',
        title: 'ArthSwap',
        category: 'De-Fi',
        numStakers: 2432,
        amtStake: 1078000,
      },
      {
        img: 'https://firebasestorage.googleapis.com/v0/b/astarnetwork-a4924.appspot.com/o/astar-dapps%2F0x1de7c3A07918fb4BE9159703e73D6e0b0736CaBC_rIb1fUz3_400x400%20(1).jpeg?alt=media&token=3832d94b-81bd-4e12-9d8b-96d83896ed3a',
        title: 'ArthSwap',
        category: 'De-Fi',
        numStakers: 2432,
        amtStake: 1078000,
      },
    ];
    items = items.concat(items.flat());
    items = items.concat(items.flat());

    return {
      items,
    };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper {
  .wrapper--header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .txt--header {
    margin-left: 6px;
    font-weight: 600;
    font-size: 22px;
    line-height: 27px;
    display: flex;
    align-items: center;
    letter-spacing: -0.02em;
    color: $gray-5-selected;
  }
}

.body--dark {
  .wrapper {
    .txt--header {
      color: $gray-1;
    }
  }
}
</style>