<template>
  <div v-if="isDisplayToken">
    <div class="border--separator" />
    <div class="rows">
      <div class="row row--details">
        <div class="row__left">
          <div class="column--currency">
            <div class="token-logo">
              <jazzicon
                v-if="token.tokenImage.includes('custom-token')"
                :address="token.id"
                :diameter="24"
              />
              <img v-else :src="token.tokenImage" alt="logo" />
            </div>
            <div class="column--ticker">
              <span class="text--title">{{ token.metadata.symbol }}</span>
              <span class="text--label">{{ token.metadata.name }}</span>
            </div>
          </div>
        </div>
        <div class="row__right">
          <div class="column column--balance">
            <div class="column__box">
              <div class="text--accent">
                <span>
                  <TokenBalance
                    :balance="String(token.userBalance)"
                    :symbol="token.metadata.symbol"
                  />
                </span>
              </div>
              <div class="text--label">
                <span>{{ $n(Number(token.userBalanceUsd)) }} {{ $t('usd') }}</span>
              </div>
            </div>
          </div>
          <div class="column--asset-buttons column--buttons--native">
            <router-link :to="buildTransferPageLink(token.metadata.symbol)">
              <button class="btn btn--sm">
                {{ $t('assets.transfer') }}
              </button>
            </router-link>
            <div class="screen--xl">
              <a
                class="box--explorer"
                :href="explorerLink"
                target="_blank"
                rel="noopener noreferrer"
              >
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { endpointKey } from 'src/config/chainEndpoints';
import { useNetworkInfo } from 'src/hooks';
import { getXcmToken } from 'src/modules/xcm';
import { buildTransferPageLink } from 'src/router/routes';
import { Asset } from 'src/v2/models';
import { computed, defineComponent, PropType } from 'vue';
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

    return {
      isDisplayToken,
      explorerLink,
      buildTransferPageLink,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list-xcm.scss';
</style>
