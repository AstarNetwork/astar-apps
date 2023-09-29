<template>
  <div class="wrapper--account-unification">
    <div class="wrapper--completed">
      <p class="emoji--completed">🍾</p>
      <p>
        {{ $t('wallet.unifiedAccount.congrats') }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  components: {},
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account-unification.scss';
</style>
