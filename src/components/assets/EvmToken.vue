<template>
  <div>
    <div class="border--separator" />
    <div class="rows">
      <div class="row row--details">
        <div class="row__left">
          <div class="column--currency">
            <img
              :src="getIcon({ symbol: token.symbol, icon: token.icon })"
              :alt="token.name"
              class="token-logo"
            />
            <div class="column--ticker">
              <span class="text--title">{{ token.symbol }}</span>
              <span class="text--label">{{ formatTokenName(token.name) }}</span>
            </div>
          </div>
        </div>
        <div class="row__right">
          <div class="column column--balance">
            <div class="column__box">
              <div class="text--accent">
                <span>{{ $n(Number(token.userBalance)) }} {{ token.symbol }}</span>
              </div>
              <div class="text--label">
                <span>{{ $n(Number(token.userBalanceUsd)) }} {{ $t('usd') }}</span>
              </div>
            </div>
          </div>
          <div class="screen--md-buttons">
            <div class="column--asset-buttons column--buttons--2-columns">
              <button class="btn btn--asset-sm bg--astar color--astar">
                {{ $t('assets.transfer') }}
              </button>
              <button class="btn btn--asset-sm bg--astar color--astar">
                {{ $t('assets.bridge') }}
              </button>
              <button v-if="isFaucet" class="btn btn--asset-sm bg--astar color--astar">
                {{ $t('assets.faucet') }}
              </button>
            </div>
          </div>
        </div>
        <!-- Fixme: This solution is not elegant. We might want to avoid DRY. -->
        <div class="screen--mobile-buttons">
          <div class="column--asset-buttons column--buttons--2-columns">
            <button class="btn btn--asset-xs bg--astar color--astar">
              {{ $t('assets.transfer') }}
            </button>
            <button class="btn btn--asset-xs bg--astar color--astar">
              {{ $t('assets.bridge') }}
            </button>
            <button v-if="isFaucet" class="btn btn--asset-xs bg--astar color--astar">
              {{ $t('assets.faucet') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { getIcon, SelectedToken } from 'src/c-bridge';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    token: {
      type: Object as PropType<SelectedToken>,
      required: true,
    },
    isFaucet: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    const formatTokenName = (name: string) => {
      switch (name) {
        case 'Shiden Network':
          return 'Shiden';
        default:
          return name;
      }
    };
    return {
      getIcon,
      formatTokenName,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
