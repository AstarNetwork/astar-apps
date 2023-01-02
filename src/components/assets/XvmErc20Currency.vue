<template>
  <div>
    <div class="border--separator" />
    <div class="rows">
      <div class="row row--details">
        <div class="row__left">
          <div class="column--currency">
            <div class="token-logo">
              <jazzicon :address="token.address" :diameter="24" />
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
                  <token-balance :balance="String(token.userBalance)" :symbol="token.symbol" />
                </span>
              </div>
              <div class="text--label">
                <span>{{ $n(Number(token.userBalanceUsd)) }} {{ $t('usd') }}</span>
              </div>
            </div>
          </div>
          <div class="column--asset-buttons column--three-buttons">
            <router-link :to="buildXvmTransferPageLink(token.symbol)">
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
                <span class="text--tooltip">{{ $t('blockscout') }}</span>
              </q-tooltip>
            </div>
            <div class="screen--xl">
              <button
                class="btn btn--sm adjuster--width btn--delete"
                @click="handleDeleteStoredToken(token.address)"
              >
                <div class="adjuster--width icon--delete">
                  <astar-icon-delete :size="22" />
                </div>
              </button>
              <q-tooltip>
                <span class="text--tooltip">{{ $t('remove') }}</span>
              </q-tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { useNetworkInfo } from 'src/hooks';
import { deleteImportedXvmToken, getErc20Explorer, Erc20Token } from 'src/modules/token';
import { buildXvmTransferPageLink } from 'src/router/routes';
import { computed, defineComponent, PropType } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';

export default defineComponent({
  components: { [Jazzicon.name]: Jazzicon, TokenBalance },
  props: {
    token: {
      type: Object as PropType<Erc20Token>,
      required: true,
    },
  },
  setup(props) {
    const { currentNetworkIdx, evmNetworkIdx } = useNetworkInfo();

    const explorerLink = computed<string>(() => {
      const tokenAddress = props.token.address;
      return getErc20Explorer({ currentNetworkIdx: currentNetworkIdx.value, tokenAddress });
    });

    const handleDeleteStoredToken = (tokenAddress: string): void => {
      deleteImportedXvmToken({ srcChainId: evmNetworkIdx.value, tokenAddress });
      window.dispatchEvent(new CustomEvent(LOCAL_STORAGE.XVM_TOKEN_IMPORTS));
    };

    return {
      explorerLink,
      buildXvmTransferPageLink,
      deleteImportedXvmToken,
      handleDeleteStoredToken,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list-xcm.scss';
</style>
