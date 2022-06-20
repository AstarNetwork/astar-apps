<template>
  <div v-if="isDisplayToken">
    <div class="border--separator" />
    <div class="rows">
      <div class="row row--details">
        <div class="row__left">
          <div class="column--currency">
            <div class="token-logo">
              <jazzicon
                v-if="tokenImage.includes('custom-token')"
                :address="token.id"
                :diameter="24"
              />
              <img v-else :src="tokenImage" alt="logo" />
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
                <span> {{ $n(truncate(token.userBalance)) }} {{ token.metadata.symbol }} </span>
              </div>
              <div class="text--label">
                <span>{{ $n(Number(token.userBalanceUsd)) }} {{ $t('usd') }}</span>
              </div>
            </div>
          </div>
          <div class="column--asset-buttons column--buttons--native">
            <button
              class="btn btn--sm"
              @click="
                handleModalXcmTransfer({
                  isOpen: true,
                  currency: token,
                })
              "
            >
              {{ $t('assets.transfer') }}
            </button>
            <div>
              <button
                v-if="isXcmCompatible"
                class="btn btn--sm"
                @click="
                  handleModalXcmBridge({
                    isOpen: true,
                    currency: token,
                  })
                "
              >
                {{ $t('assets.xcm') }}
              </button>
            </div>
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
                <span class="text--tooltip">{{ $t('polkadot-js-app') }}</span>
              </q-tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { endpointKey, getProviderIndex } from 'src/config/chainEndpoints';
import { useXcmTokenDetails } from 'src/hooks';
import { truncate } from 'src/hooks/helper/common';
import { ChainAsset } from 'src/hooks/xcm/useXcmAssets';
import { useStore } from 'src/store';
import { computed, defineComponent, PropType } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';

export default defineComponent({
  components: { [Jazzicon.name]: Jazzicon },
  props: {
    token: {
      type: Object as PropType<ChainAsset>,
      required: true,
    },
    handleModalXcmTransfer: {
      type: Function,
      required: true,
    },
    handleModalXcmBridge: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const t = computed(() => props.token);
    const { tokenImage, tokenDetails, isXcmCompatible } = useXcmTokenDetails(t);
    const store = useStore();

    const isDisplayToken = computed<boolean>(() => {
      // Todo: fetch the balance in relaychain
      const isDisplay = Number(props.token.userBalance) > 0 || tokenDetails.value?.isXcmCompatible;
      return isDisplay || false;
    });

    const explorerLink = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      const chain = chainInfo ? chainInfo.chain : '';
      const currentNetworkIdx = getProviderIndex(chain);

      const astarBalanceUrl =
        'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc.astar.network#/assets/balances';
      const shidenBalanceUrl =
        'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc.shiden.astar.network#/assets/balances';

      return currentNetworkIdx === endpointKey.ASTAR ? astarBalanceUrl : shidenBalanceUrl;
    });

    return {
      tokenImage,
      tokenDetails,
      isDisplayToken,
      isXcmCompatible,
      explorerLink,
      truncate,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list-xcm.scss';
</style>
