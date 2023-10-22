<template>
  <div v-if="isDisplayToken">
    <div class="row" :class="isExpand && 'row--is-expand'">
      <div class="row__left" @click="isExpand = !isExpand">
        <div class="column--token">
          <div class="icon--token">
            <jazzicon
              v-if="token.tokenImage.includes('custom-token')"
              :address="token.mappedERC20Addr"
              :diameter="24"
            />
            <img v-else :src="token.tokenImage" alt="logo" />
          </div>
          <div>
            <div class="text--title">{{ token.metadata.symbol }}</div>
            <div class="text--label">{{ token.metadata.name }}</div>
          </div>
        </div>

        <div class="column--balance">
          <div class="column--balance__row text--title">
            <token-balance :balance="String(token.userBalance)" :symbol="token.metadata.symbol" />
          </div>
          <div class="column--balance__row text--label">
            {{ $n(Number(token.userBalanceUsd)) }} {{ $t('usd') }}
          </div>
        </div>
      </div>

      <q-slide-transition :duration="150">
        <div v-show="isExpand || width >= screenSize.sm" class="row__right">
          <div>
            <router-link :to="buildTransferPageLink(token.metadata.symbol)">
              <button class="btn btn--icon">
                <astar-icon-transfer />
              </button>
            </router-link>
            <span class="text--expand-menu">{{ $t('assets.send') }}</span>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('assets.send') }}</span>
            </q-tooltip>
          </div>

          <div>
            <a :href="explorerLink" target="_blank" rel="noopener noreferrer">
              <button class="btn btn--icon">
                <astar-icon-external-link class="icon--external-link" />
              </button>
            </a>
            <span class="text--expand-menu">{{ $t('subscan') }}</span>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('subscan') }}</span>
            </q-tooltip>
          </div>
        </div>
      </q-slide-transition>
    </div>
  </div>
</template>
<script lang="ts">
import { endpointKey } from 'src/config/chainEndpoints';
import { useNetworkInfo, useBreakpoints } from 'src/hooks';
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
    const isExpand = ref<boolean>(false);
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

    const { width, screenSize } = useBreakpoints();

    return {
      isDisplayToken,
      explorerLink,
      isExpand,
      width,
      screenSize,
      buildTransferPageLink,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list-xcm.scss';
</style>
