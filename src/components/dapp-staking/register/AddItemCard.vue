<template>
  <div class="container card-new-item" @click="onClick">
    <icon-base width="24" height="24"><icon-document /></icon-base>
  </div>
</template>

<script lang="ts">
import { IconDocument, IconBase } from '@astar-network/astar-ui';
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
    IconBase,
    IconDocument,
  },
  emits: ['click'],
  setup(_, { emit }) {
    const onClick = () => {
      emit('click');
    };

    return {
      onClick,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/chart-panel.scss';

.card-new-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 120px;
  height: 82px;
  border-radius: 6px;
}
</style>
