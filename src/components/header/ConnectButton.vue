<template>
  <button type="button" :class="width >= screenSize.sm ? 'btn--connect' : 'm-btn--connect'">
    <astar-icon-base class="iconbase" stroke="currentColor">
      <slot />
    </astar-icon-base>
    <template v-if="width >= screenSize.sm">
      <span class="text--connect">
        {{ $t('connect') }}
      </span>
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
  color: $navy-1;
  flex-direction: row;
  align-items: center;
  padding: 8px 16px 8px 16px;
  background: transparent;
  border-radius: 16px;
  margin-left: 8px;
  transition: all 0.3s ease 0s;
  border: 1px solid $gray-4;

  @media (min-width: $lg) {
    border: 1px solid $navy-3;
  }

  @media (min-width: $sm) {
    margin-left: 16px;
  }
}
.btn--connect:hover {
  background: $astar-blue !important;
  border: 1px solid transparent;
  .iconbase {
    color: $gray-1;
  }
  @media (min-width: $lg) {
    background: transparent !important;
    border: 1px solid $gray-4;
    .iconbase {
      color: $gray-5;
    }
  }
}

.m-btn--connect {
  padding-left: 10px;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid $gray-4;
  border-radius: 16px;
  margin-left: 16px;
  transition: all 0.3s ease 0s;
  @media (min-width: $lg) {
    border: 1px solid $navy-3;
  }
}
.m-btn--connect:hover {
  background: $astar-blue;
  border: 1px solid transparent;
  @media (min-width: $lg) {
    background: #fff;
  }
  .iconbase {
    color: $gray-1;
  }
}
.iconbase {
  color: $gray-4;
  width: rem(20);
  height: rem(20);
  margin-left: -4px;
  margin-right: 4px;
  transition: all 0.3s ease 0s;
}

.text--connect {
  font-weight: 400;
  font-size: 14px;
  color: $gray-1;
  @media (min-width: $lg) {
    color: $navy-1;
  }
}

.body--dark {
  .btn--connect {
    background: transparent;
    color: #fff;
    border: 1px solid $gray-4;
  }
  .btn--connect:hover {
    background: $astar-blue !important;
    border: 1px solid transparent;
    .iconbase {
      color: $gray-1;
    }
  }
  .iconbase {
    color: $gray-3;
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
  .text--connect {
    color: $gray-1;
  }
}
</style>
