<template>
  <div class="wrapper--dapp-background">
    <img class="image--dapp-icon" :src="dapp?.basic.iconUrl" :alt="dapp?.basic.name" />
  </div>
</template>
<script lang="ts">
import { CombinedDappInfo } from 'src/staking-v3/logic';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    dapp: {
      type: Object as PropType<CombinedDappInfo>,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
.wrapper--dapp-background {
  position: absolute;
  z-index: 0;
  right: calc(50% - 200px);
  top: -350px;
  @media (min-width: $sm) {
    right: -200px;
    top: -500px;
  }
}
.image--dapp-icon {
  width: 400px;
  height: 400px;
  object-fit: cover;
  overflow: hidden;
  border-radius: 99999px;
  filter: blur(80px) brightness(1.2);
  opacity: 0.5;
  @media (min-width: $sm) {
    width: 600px;
    height: 600px;
    filter: blur(150px) brightness(1.2);
  }
}
</style>
