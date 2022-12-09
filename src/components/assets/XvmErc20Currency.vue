<template>
  <div>
    <div class="border--separator" />
    <div class="rows">
      <div class="row row--details">
        <div class="row__left">
          <div class="column--currency">
            <div class="token-logo">
              <jazzicon :address="token.erc20Contract" :diameter="24" />
            </div>
            <div class="column--ticker">
              <span class="text--title">{{ token.symbol }}</span>
              <span class="text--label">{{ token.name }}</span>
            </div>
          </div>
        </div>
        <div class="row__right">
          <div class="column column--balance">
            <div class="column__box">
              <div class="text--accent">
                <span>
                  <TokenBalance :balance="String(token.userBalance)" :symbol="token.symbol" />
                </span>
              </div>
              <div class="text--label">
                <span>{{ $n(Number(token.userBalanceUsd)) }} {{ $t('usd') }}</span>
              </div>
            </div>
          </div>
          <div class="column--asset-buttons column--buttons--native">
            <router-link :to="buildTransferPageLink(token.symbol)">
              <button class="btn btn--sm">
                {{ $t('assets.transfer') }}
              </button>
            </router-link>
            <!-- <div class="screen--xl">
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
            </div> -->
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
import { XvmAsset } from 'src/modules/token';
export default defineComponent({
  components: { [Jazzicon.name]: Jazzicon, TokenBalance },
  props: {
    token: {
      type: Object as PropType<XvmAsset>,
      required: true,
    },
  },
  setup(props) {
    const t = computed<any>(() => props.token);
    const { currentNetworkIdx } = useNetworkInfo();

    // const explorerLink = computed<string>(() => {
    //   const astarBalanceUrl = 'https://astar.subscan.io/assets/' + t.value.id;
    //   const shidenBalanceUrl = 'https://shiden.subscan.io/assets/' + t.value.id;
    //   return currentNetworkIdx.value === endpointKey.ASTAR ? astarBalanceUrl : shidenBalanceUrl;
    // });

    return {
      // explorerLink,
      buildTransferPageLink,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list-xcm.scss';
</style>
