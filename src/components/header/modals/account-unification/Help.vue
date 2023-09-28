<template>
  <div class="wrapper--help">
    <div class="text--title">{{ $t('wallet.unifiedAccount.needHelp') }}</div>
    <dl class="list--help">
      <dt>{{ $t('wallet.unifiedAccount.whichAddress.q') }}</dt>
      <dd>
        {{ $t('wallet.unifiedAccount.whichAddress.a') }}
        <br /><a href="#">{{ $t('wallet.unifiedAccount.userTutorials') }}</a>
      </dd>
    </dl>
    <ul>
      <li>
        <a href="#">{{ $t('wallet.unifiedAccount.userTutorials') }}</a>
      </li>
      <li>
        <a href="#">{{ $t('wallet.unifiedAccount.aboutForUsers') }}</a>
      </li>
      <li>
        <a href="#">{{ $t('wallet.unifiedAccount.techDocs') }}</a>
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
