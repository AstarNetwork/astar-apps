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
import { defineComponent } from 'vue';
import { useBreakpoints } from 'src/hooks';

export default defineComponent({
  setup() {
    const { width, screenSize } = useBreakpoints();

    return {
      width,
      screenSize,
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
  background: transparent;
  border: 1px solid $gray-3;
  border-radius: 16px;
  margin-left: 8px;
  transition: all 0.3s ease 0s;
}
.btn--connect:hover {
  background: #fff;
}

.m-btn--connect {
  padding-left: 10px;
  width: 32px;
  height: 32px;
  border: 1px solid $gray-3;
  border-radius: 16px;
  margin-left: 16px;
  transition: all 0.3s ease 0s;
}
.m-btn--connect:hover {
  background: #fff;
}
.iconbase {
  color: $gray-3;
  width: rem(20);
  height: rem(20);
  margin-left: -4px;
  margin-right: 4px;
  transition: all 0.3s ease 0s;
}

.body--dark {
  .btn--connect {
    background: transparent;
    color: #fff;
    border: 1px solid $gray-4;
  }
  .btn--connect:hover {
    background: $astar-blue;
    border: 1px solid transparent;
    .iconbase {
      color: $gray-1;
    }
  }

  .m-btn--connect {
    background: transparent;
    color: $gray-3;
    border: 1px solid $gray-4;
  }
  .m-btn--connect:hover {
    background: $astar-blue;
    border: 1px solid transparent;
    .iconbase {
      color: $gray-1;
    }
  }
}
</style>
