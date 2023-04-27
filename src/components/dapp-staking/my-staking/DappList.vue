<template>
  <div v-if="dapps && dapps.length > 0" class="wrapper">
    <div class="divider" />
    <div class="wrapper--header">
      <div class="txt--header">{{ category }}</div>
    </div>
    <card-list :category="category" :dapps="dapps" />
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'src/store';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import CardList from './components/CardList.vue';
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
    const dapps = computed<DappCombinedInfo[]>(() => {
      const dappsArray = store.getters['dapps/getRegisteredDapps'](props.category.toLowerCase());
      return dappsArray.filter((it: DappCombinedInfo) => it.dapp);
    });

    return {
      dapps,
    };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper {
  padding-left: 8px;
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
    color: $navy-1;
  }
}

.divider {
  border-top: 1px solid transparent;
  border-image: linear-gradient(
    121.48deg,
    #e6007a -5.77%,
    #703ac2 13.57%,
    #0070eb 34.18%,
    #0297fb 58.08%,
    #0ae2ff 74.93%
  );
  border-image-slice: 1;
  /* margin-top: 24px; */
  margin-top: 80px;
  margin-bottom: 24px;
}

.body--dark {
  .wrapper {
    .txt--header {
      color: $gray-1;
    }
  }
  .divider {
    border-color: $gray-5;
  }
}
</style>
