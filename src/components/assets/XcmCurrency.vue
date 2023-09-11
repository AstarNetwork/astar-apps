<template>
  <div v-if="isDisplayToken" class="row" :class="isExpand ? 'is-expand' : ''">
    <div class="row__left" @click="() => (isExpand = !isExpand)">
      <div class="column--currency">
        <div class="token-logo">
          <jazzicon
            v-if="token.tokenImage.includes('custom-token')"
            :address="token.mappedERC20Addr"
            :diameter="24"
          />
          <img v-else :src="token.tokenImage" alt="logo" />
        </div>
        <div>
          <div class="text--title">{{ token.metadata.symbol }}</div>
          <div class="ttext--label">{{ token.metadata.name }}</div>
        </div>
      </div>
      <div class="column--balance">
        <div class="text--title">
          <token-balance :balance="String(token.userBalance)" :symbol="token.metadata.symbol" />
        </div>
        <div class="text--label">
          <span> {{ $n(Number(token.userBalanceUsd)) }} {{ $t('usd') }}</span>
        </div>
      </div>
    </div>

    <!-- for desktop -->
    <div class="row__right">
      <router-link :to="buildTransferPageLink(token.metadata.symbol)">
        <button class="btn btn--sm">
          {{ $t('assets.transfer') }}
        </button>
      </router-link>
      <div>
        <a class="box--explorer" :href="explorerLink" target="_blank" rel="noopener noreferrer">
          <button class="btn btn--sm adjuster--width">
            <div class="container--explorer-icon adjuster--width">
              <astar-icon-external-link />
            </div>
          </button>
        </a>
        <q-tooltip>
          <span class="text--tooltip">{{ $t('subscan') }}</span>
        </q-tooltip>
      </div>
      <div>
        <button class="btn btn--sm adjuster--width">
          <div class="container--explorer-icon adjuster--width">
            <span> ★ </span>
          </div>
        </button>
        <q-tooltip>
          <span class="text--tooltip">{{ $t('assets.addToFavorite') }}</span>
        </q-tooltip>
      </div>
    </div>

    <!-- fot mobile/tablet -->
    <q-slide-transition :duration="150">
      <div v-show="isExpand" class="row__expand">
        <div class="row__expand-inner">
          <div class="icon-buttons">
            <button>
              <span> ★ </span>
            </button>
            <a class="" :href="explorerLink" target="_blank" rel="noopener noreferrer">
              <button>
                <astar-icon-external-link />
              </button>
            </a>
          </div>
          <div class="text-buttons">
            <router-link :to="buildTransferPageLink(token.metadata.symbol)">
              <button class="btn btn--sm">
                {{ $t('assets.transfer') }}
              </button>
            </router-link>
          </div>
        </div>
      </div>
    </q-slide-transition>
  </div>
</template>
<script lang="ts">
import { endpointKey } from 'src/config/chainEndpoints';
import { useNetworkInfo } from 'src/hooks';
import { getXcmToken } from 'src/modules/xcm';
import { buildTransferPageLink } from 'src/router/routes';
import { Asset } from 'src/v2/models';
import { computed, defineComponent, PropType, ref } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';
import TokenBalance from 'src/components/common/TokenBalance.vue';
export default defineComponent({
  components: { [Jazzicon.name]: Jazzicon, TokenBalance },
  props: {
    token: {
      type: Object as PropType<Asset>,
      required: true,
    },
  },
  setup(props) {
    const t = computed<Asset>(() => props.token);
    const { currentNetworkIdx } = useNetworkInfo();

    const isDisplayToken = computed<boolean>(() => {
      const token = getXcmToken({
        id: t.value.id,
        currentNetworkIdx: currentNetworkIdx.value,
      });
      const isDisplay = Number(props.token.userBalance) > 0 || !!token;
      return isDisplay || false;
    });

    const explorerLink = computed<string>(() => {
      const astarBalanceUrl = 'https://astar.subscan.io/assets/' + t.value.id;
      const shidenBalanceUrl = 'https://shiden.subscan.io/assets/' + t.value.id;
      return currentNetworkIdx.value === endpointKey.ASTAR ? astarBalanceUrl : shidenBalanceUrl;
    });

    const isExpand = ref<boolean>(false);

    return {
      isDisplayToken,
      explorerLink,
      buildTransferPageLink,
      isExpand,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list-xcm.scss';
</style>
