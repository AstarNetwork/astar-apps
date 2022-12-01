<template>
  <div class="card-new-item" @click="onClick">
    <icon-base class="icon--plus"><icon-plus /></icon-base>
  </div>
</template>

<script lang="ts">
import { IconPlus, IconBase } from '@astar-network/astar-ui';
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
    IconBase,
    IconPlus,
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
.card-new-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 120px;
  height: 82px;
  border-radius: 6px;
  background-color: $gray-1;
}

.body--dark {
  .card-new-item {
    background-color: $gray-5;
  }
}

.icon--plus {
  stroke: $gray-5-selected;
  border: 1px solid $gray-5-selected;
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.body--dark {
  .icon--plus {
    stroke: $gray-1;
    border-color: $gray-1;
  }
}
</style>
