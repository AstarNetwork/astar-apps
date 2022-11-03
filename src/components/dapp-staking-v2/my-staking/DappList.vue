<template>
  <div v-if="dapps && dapps.length > 0" class="wrapper">
    <div class="wrapper--header">
      <div class="txt--header">{{ category }}</div>
      <!-- <astar-irregular-button width="77" height="20">See All</astar-irregular-button> -->
    </div>
    <CardList :category="category" :dapps="dapps" />
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import CardList from './components/CardList.vue';
import { useStore } from 'src/store';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
export default defineComponent({
  components: { CardList },
  props: {
    category: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const dapps = computed<DappCombinedInfo[]>(() =>
      store.getters['dapps/getRegisteredDapps'](props.category.toLowerCase())
    );

    return {
      dapps,
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
