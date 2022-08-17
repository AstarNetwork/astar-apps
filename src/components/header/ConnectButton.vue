<template>
  <button type="button" :class="width >= screenSize.sm ? 'btn--connect' : 'm-btn--connect'">
    <astar-icon-base class="iconbase" stroke="currentColor">
      <slot />
    </astar-icon-base>
    <template v-if="width >= screenSize.sm">
      {{ $t('connect') }}
    </template>
  </button>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import { useBreakpoints } from 'src/hooks';

export default defineComponent({
  props: {},
  setup(props) {
    const { width, screenSize } = useBreakpoints();

    return {
      width,
      screenSize,
      ...toRefs(props),
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
@import 'src/css/utils.scss';

.btn--connect {
  display: flex;
  height: 32px;
  color: $gray-5;
  flex-direction: row;
  align-items: center;
  padding: 8px 16px 8px 16px;
  background: #fff;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.25);
  border-radius: 16px;
  margin-left: 8px;
}
.btn--connect:hover {
  background: #fff;
}

.m-btn--connect {
  padding-left: 10px;
  width: 32px;
  height: 32px;
  background: #fff;
  border: 1px solid $gray-3;
  border-radius: 16px;
  margin-left: 16px;
}
.m-btn--connect:hover {
  background: #fff;
}
.iconbase {
  color: $astar-blue-dark;
  width: rem(20);
  height: rem(20);
  margin-left: -4px;
  margin-right: 4px;
}

.body--dark {
  .btn--connect {
    background: $gray-5;
    color: #fff;
  }
  .btn--connect:hover {
    background: $gray-5-selected;
  }

  .m-btn--connect {
    background: $gray-6;
    border: 1px solid $gray-4;
  }
  .m-btn--connect:hover {
    background: $gray-5-selected;
  }

  .iconbase {
    color: $gray-4;
  }
}
</style>
