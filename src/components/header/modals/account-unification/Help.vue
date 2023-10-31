<template>
  <div class="wrapper--help">
    <div class="text--title">{{ $t('wallet.unifiedAccount.onlyShibuya') }}</div>
    <ul>
      <li>
        <a
          href="https://docs.astar.network/docs/build/astar-beta-labs/account-unification/"
          target="_blank"
          >{{ $t('wallet.unifiedAccount.userTutorials') }}</a
        >
      </li>
    </ul>
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
