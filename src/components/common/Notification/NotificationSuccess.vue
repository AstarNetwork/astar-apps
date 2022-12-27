<template>
  <div :class="['noti', show && 'show']" @click="close">
    <div class="noti-content">
      <div class="row--close">
        <div class="column--title">Success</div>
        <div class="column--close">
          <IconClose />
        </div>
      </div>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import IconClose from './IconClose.vue';

export default defineComponent({
  name: 'NotificationSuccess',
  components: { IconClose },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const close = (e: any) => {
      if (e.target.className === 'column--close') {
        emit('close');
      }
    };

    return {
      ...toRefs(props),
      close,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
.noti {
  display: none;
  border: 1px solid $astar-blue;
  color: $gray-5-selected;
  width: 300px;
}

.noti.show {
  display: block;
}

.row--close {
  display: flex;
  color: #b1b7c1;
  justify-content: space-between;
  font-weight: 330;
  margin-right: rem(12.8);
  height: rem(30);
}

.column--title {
  display: flex;
  justify-content: center;
  font-style: normal;
  font-weight: 590;
  font-size: rem(22);
  color: $gray-5;
}

.column--close {
  cursor: pointer;
  padding-top: 6px;
}

.close:hover {
  color: #d8e2f1;
}
</style>
