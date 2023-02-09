<template>
  <div class="tw-rounded-full image-shadow">
    <astar-icon-social :icon="iconName" />
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs, PropType } from 'vue';
import { SocialIcon } from '@astar-network/astar-ui';

export default defineComponent({
  props: {
    iconName: {
      type: Object as PropType<SocialIcon>,
      required: true,
    },
  },
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
</script>

<style scoped>
.image-shadow {
  box-shadow: 0 4px 12px rgba(0, 34, 51, 0.08), 0 2px 4px rgba(0, 34, 51, 0.16);
}
</style>
