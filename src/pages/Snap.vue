<template>
  <div v-if="isReady" class="extra-wrapper">
    <div
      class="container--main"
      :style="{ backgroundImage: `url(${isDarkTheme ? bg_img.dark : bg_img.light})` }"
    >
      <div class="wrapper--title">
        <div class="txt--title animate__animated animate__zoomInRight">
          {{ $t('snap.name') }}
        </div>
        <div class="txt--subtitle animate__animated animate__fadeIn animate__delay-1s">
          {{ $t('snap.purpose') }}
        </div>
      </div>

      <div class="staking-container">
        <div class="wrapper--tabs responsive">
          <div class="wrapper--panel">
            <p>
              {{ $t('snap.description') }}
            </p>
            <h3>{{ $t('snap.pleaseNote') }}:</h3>
            <ul>
              <li>
                {{ $t('snap.pn1') }}
              </li>
              <li>
                {{ $t('snap.pn2') }}
              </li>
              <li>
                {{ $t('snap.pn3') }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="cards responsive">
      <div class="card">
        <p>
          {{ $t('snap.description') }}
        </p>
      </div>
      <div class="card">
        <p>
          {{ $t('snap.description') }}
        </p>
      </div>
      <div class="card">
        <p>
          {{ $t('snap.description') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { usePageReady } from 'src/hooks';
import { useStore } from 'src/store';
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'Snap',
  setup() {
    const store = useStore();
    const { isReady } = usePageReady();
    const { t } = useI18n();
    const isDarkTheme = computed<boolean>(() => store.getters['general/theme'] === 'DARK');
    const bg_img = {
      light: require('/src/assets/img/dapps_staking_bg_light.webp'),
      dark: require('/src/assets/img/dapps_staking_bg_dark.webp'),
    };

    return { isReady, isDarkTheme, bg_img };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
@import 'src/components/dapp-staking/my-staking/styles/top-metric.scss';
@import 'src/components/dapp-staking/my-staking/styles/my-staking.scss';
.extra-wrapper {
  max-width: $container-max-width;
  margin: 0 auto;
}
.container--main {
  width: 100%;
  padding: 0px 0px 24px 0px;
  margin: 0 auto;

  @media (min-width: $md) {
    max-width: 720px;
  }

  @media (min-width: $widthCardLineUp) {
    max-width: 100%;
  }
  @media (min-width: $lg) {
    margin-top: 50px;
  }
}

.divider {
  border-top: 1px solid transparent;
  border-image: linear-gradient(
    121.48deg,
    #e6007a -5.77%,
    #703ac2 13.57%,
    #0070eb 34.18%,
    #0297fb 58.08%,
    #0ae2ff 74.93%
  );
  border-image-slice: 1;
  margin-top: 80px;
  margin-bottom: 24px;
}

.container--divider {
  padding: 0 16px;
  @media (min-width: $lg) {
    padding: 0;
  }
}

.body--dark {
  .divider {
    border-color: $gray-5;
  }
}
</style>
