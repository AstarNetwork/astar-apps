<template>
  <div>
    <BackToAsset />
    <MobileNavigator />
    <div class="wrapper--transfer">
      <div class="container--transfer">
        <div class="row--tab">
          <div>XCM</div>
          <div>Transfer</div>
        </div>
        <div class="wrapper-containers">
          <div>left</div>
          <div>right</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import BackToAsset from 'src/components/assets/transfer/BackToAsset.vue';
import MobileNavigator from 'src/components/assets/transfer/MobileNavigator.vue';

export default defineComponent({
  components: { BackToAsset, MobileNavigator },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/transfer.scss';
</style>
