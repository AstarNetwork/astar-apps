<template>
  <div
    class="liquid-wrapper"
    :style="`background-image: url('${require('/src/assets/img/algem/algem_landing.jpg')}')`"
  >
    <div class="text--title">
      {{ $t('dappStaking.algem.liquidStakingTitle') }}
    </div>
    <div class="text--run-by">
      {{ $t('dappStaking.algem.runBy') }}
      <img src="~assets/img/algem/algem_logo.png" width="90" height="40" />
    </div>
    <div class="wrapper--feature">
      <div class="text--subtitle">
        <img src="~assets/img/algem/algem_subtitle_1.png" width="31" height="32" />
        {{ $t('dappStaking.algem.subtitle0') }}
      </div>
      <div class="text--desc">
        {{ $t('dappStaking.algem.desc0') }}
      </div>
      <div class="text--subtitle">
        <img src="~assets/img/algem/algem_subtitle_2.png" width="31" height="32" />
        {{ $t('dappStaking.algem.subtitle1') }}
      </div>
      <div class="text--desc">
        {{ $t('dappStaking.algem.desc1') }}
      </div>
      <div class="text--subtitle">
        <img src="~assets/img/algem/algem_subtitle_3.png" width="31" height="32" />
        {{ $t('dappStaking.algem.subtitle2') }}
      </div>
      <div class="text--desc">
        {{ $t('dappStaking.algem.desc2') }}
      </div>
    </div>
    <div class="row--warn">
      <div>{{ $t('dappStaking.algem.warnTitle') }} :</div>
      <ul>
        <li>
          {{ $t('dappStaking.algem.warnRow0') }}
        </li>
        <li>
          <div class="li--row" @click="linkAlgemFaq">
            {{ $t('dappStaking.algem.warnRow1') }}
            <span class="icon-external">
              <astar-icon-external-link width="24" height="24" />
            </span>
          </div>
        </li>
      </ul>
    </div>
    <div class="text--final">{{ $t('dappStaking.algem.textFinal') }}</div>
    <button class="button btn--launch" @click="linkLaunchApp">
      <span class="icon-external"><astar-icon-external-link /></span>
      {{ $t('dappStaking.algem.launchAlgemApp') }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const linkLaunchApp = () => {
      window.open('https://app.algem.io/liquid-staking', '_blank');
    };

    const linkAlgemFaq = () => {
      window.open(
        'https://docs.algem.io/algem-protocol/liquid-staking/liquid-staking-faq',
        '_blank'
      );
    };

    return {
      linkLaunchApp,
      linkAlgemFaq,
    };
  },
});
</script>
<style lang="scss" scoped>
@use 'src/components/dapp-staking/styles/algem-panel.scss';
</style>
