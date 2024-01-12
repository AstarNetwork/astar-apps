<template>
  <div class="wrapper--edit">
    <div class="row--title">
      <span> {{ $t('stakingV3.edit') }} </span>
    </div>
    <div class="box--links">
      <!-- Todo: add links -->
      <div class="box--link">
        <div class="box__top" />
        <div class="box__middle">
          <span>{{ $t('stakingV3.editProjectPage.title') }}</span>
        </div>
        <div class="box__bottom">
          <span>{{ $t('stakingV3.editProjectPage.text') }}</span>
        </div>
      </div>
      <div class="box--link">
        <div class="box__top" />
        <div class="box__middle">
          <span>{{ $t('stakingV3.editYourInfo.title') }}</span>
        </div>
        <div class="box__bottom">
          <span>{{ $t('stakingV3.editYourInfo.text') }}</span>
        </div>
      </div>
      <div class="box--link">
        <div class="box__top" />
        <div class="box__middle">
          <span>{{ $t('stakingV3.addPromotion.title') }}</span>
        </div>
        <div class="box__bottom">
          <span>{{ $t('stakingV3.addPromotion.text') }}</span>
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
