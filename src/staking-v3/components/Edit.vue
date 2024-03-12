<template>
  <div class="wrapper--edit">
    <div class="row--title">
      <span> {{ $t('stakingV3.edit') }} </span>
    </div>
    <div class="box--links">
      <router-link :to="getRegisterPageUrl()" class="box--link">
        <div class="box__top" />
        <div class="box__middle">
          <span>{{ $t('stakingV3.editProjectPage.title') }}</span>
        </div>
        <div class="box__bottom">
          <span>{{ $t('stakingV3.editProjectPage.text') }}</span>
        </div>
      </router-link>
      <div class="box--link">
        <div class="box__top" />
        <div class="box__middle">
          <span>{{ $t('stakingV3.editYourInfo.title') }}</span>
        </div>
        <div class="box__bottom">
          <span>{{ $t('stakingV3.editYourInfo.text') }}</span>
        </div>
        <q-tooltip>
          <span class="text--tooltip">{{ $t('common.comingSoon') }}</span>
        </q-tooltip>
      </div>
      <a
        :href="docsUrl.createPromotion"
        target="_blank"
        rel="noopener noreferrer"
        class="box--link"
      >
        <div class="box__top" />
        <div class="box__middle">
          <span>{{ $t('stakingV3.addPromotion.title') }}</span>
        </div>
        <div class="box__bottom">
          <span>{{ $t('stakingV3.addPromotion.text') }}</span>
        </div>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useDappStakingNavigation } from '../hooks';
import { docsUrl } from 'src/links';

export default defineComponent({
  components: {},
  setup() {
    const { getRegisterPageUrl } = useDappStakingNavigation();

    return { docsUrl, getRegisterPageUrl };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/edit.scss';
</style>
