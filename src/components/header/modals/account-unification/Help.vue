<template>
  <div class="wrapper--help">
    <div class="text--title">Need help?</div>
    <dl class="list--help">
      <dt>[place holder] I don’t know which address I need to use?</dt>
      <dd>
        You don’t need to think of which one, balance of the both accounts are the same. You don’t
        need to think of which one, balance of the both accounts are the same. <br />
        <a href="#">User tutorials</a>
      </dd>
    </dl>
    <ul>
      <li><a href="#">User tutorials</a></li>
      <li><a href="#">About the unified accounts for users</a></li>
      <li><a href="#">Tech docs</a></li>
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
