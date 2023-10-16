<template>
  <img
    v-if="unifiedAccount?.avatarUrl"
    :src="unifiedAccount?.avatarUrl"
    class="text--account-name__icon"
  />
  <jazzicon
    v-else
    class="text--account-name__icon"
    :address="unifiedAccount?.nativeAddress"
    :diameter="32"
  />
</template>

<script lang="ts">
import { UnifiedAccount } from 'src/store/general/state';
import { defineComponent, PropType } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';

export default defineComponent({
  components: { [Jazzicon.name]: Jazzicon },
  props: {
    unifiedAccount: {
      type: Object as PropType<UnifiedAccount | undefined>,
      required: true,
    },
  },

  setup() {},
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account-unification.scss';
</style>
