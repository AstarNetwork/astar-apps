<template>
  <div class="wrapper--edit">
    <div class="row--title">
      <span> {{ $t('dappStaking.dappPage.v3.edit') }} </span>
    </div>
    <div class="box--links">
      <!-- Todo: add links -->
      <div class="box--link">
        <div class="box__top" />
        <div class="box__middle">
          <span>{{ $t('dappStaking.dappPage.v3.editProjectPage.title') }}</span>
        </div>
        <div class="box__bottom">
          <span>{{ $t('dappStaking.dappPage.v3.editProjectPage.text') }}</span>
        </div>
      </div>
      <div class="box--link">
        <div class="box__top" />
        <div class="box__middle">
          <span>{{ $t('dappStaking.dappPage.v3.editYourInfo.title') }}</span>
        </div>
        <div class="box__bottom">
          <span>{{ $t('dappStaking.dappPage.v3.editYourInfo.text') }}</span>
        </div>
      </div>
      <div class="box--link">
        <div class="box__top" />
        <div class="box__middle">
          <span>{{ $t('dappStaking.dappPage.v3.addPromotion.title') }}</span>
        </div>
        <div class="box__bottom">
          <span>{{ $t('dappStaking.dappPage.v3.addPromotion.text') }}</span>
        </div>
      </div>
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
@use './styles/edit.scss';
</style>
