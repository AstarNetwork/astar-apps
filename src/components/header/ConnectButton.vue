<template>
  <button type="button" :class="width >= screenSize.sm ? 'btn--connect' : 'm-btn--connect'">
    <icon-base
      class="tw-w-5 tw-h-5 tw-text-astarblue tw--ml-1 tw-mr-1"
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

<style scoped>
.btn--connect {
  display: flex;
  height: 32px;
  color: #fff;
  flex-direction: row;
  align-items: center;
  padding: 8px 16px 8px 16px;
  background: #2c3335;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.25);
  border-radius: 16px;
}
.btn--connect:hover {
  background: #3c4649;
}

.m-btn--connect {
  padding-left: 10px;
  width: 32px;
  height: 32px;
  background: #2c3335;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.25);
  border-radius: 16px;
}
.m-btn--connect:hover {
  background: #3c4649;
}
</style>
