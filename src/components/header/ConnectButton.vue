<template>
  <button type="button" :class="width >= screenSize.sm ? 'btn--connect' : 'm-btn--connect'">
    <icon-base
      class="iconbase tw-w-5 tw-h-5 tw--ml-1 tw-mr-1"
      stroke="currentColor"
      icon-name="wallet"
    >
      <icon-wallet />
    </icon-base>
    <template v-if="width >= screenSize.sm">
      {{ $t('connect') }}
    </template>
  </button>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import { useBreakpoints } from 'src/hooks';
import IconBase from 'components/icons/IconBase.vue';
import IconWallet from 'components/icons/IconWallet.vue';

export default defineComponent({
  components: {
    IconBase,
    IconWallet,
  },
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
}
.btn--connect:hover {
  background: #fff;
}

.m-btn--connect {
  padding-left: 10px;
  width: 32px;
  height: 32px;
  background: #fff;
  border: 1px solid $object-light;
  border-radius: 16px;
}
.m-btn--connect:hover {
  background: #fff;
}
.iconbase {
  color: $astar-blue-dark;
}

.body--dark {
  .btn--connect {
    background: $gray-5;
    color: #fff;
  }
  .btn--connect:hover {
    background: #3c4649;
  }

  .m-btn--connect {
    background: $gray-6;
    border: 1px solid $gray-5;
  }
  .m-btn--connect:hover {
    background: #3c4649;
  }
}
</style>
