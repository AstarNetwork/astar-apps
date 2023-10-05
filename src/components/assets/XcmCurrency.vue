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
          <div class="text--title">
            <token-balance :balance="token.userBalance" :symbol="token.metadata.symbol" />
          </div>
          <div class="text--label">
            <span>{{ $n(Number(token.userBalanceUsd)) }} {{ $t('usd') }}</span>
          </div>
        </div>
      </div>

      <q-slide-transition :duration="150">
        <div v-show="isExpand || width >= screenSize.sm" class="row__right">
          <div>
            <router-link :to="buildTransferPageLink(token.metadata.symbol)">
              <button class="btn btn--icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.7779 23.1919C14.4179 23.1919 14.0879 23.0119 13.8879 22.7019L9.06792 15.1219L1.48792 10.3019C1.14792 10.0819 0.957917 9.6919 1.00792 9.2919C1.05792 8.8919 1.33792 8.55191 1.71792 8.42191L20.8079 2.0519C21.1879 1.9319 21.5979 2.0219 21.8779 2.3019C22.1579 2.5819 22.2579 3.0019 22.1279 3.3719L15.7679 22.4619C15.6379 22.8419 15.2979 23.1219 14.8979 23.1719C14.8579 23.1719 14.8079 23.1719 14.7679 23.1719L14.7779 23.1919ZM11.1679 14.5119L14.4779 19.7219L19.4779 4.7119L4.46792 9.71191L9.67792 13.0219L14.7379 7.96191C15.1479 7.55191 15.8079 7.55191 16.2179 7.96191C16.6279 8.3719 16.6279 9.04191 16.2179 9.44191L11.1579 14.5019L11.1679 14.5119Z"
                    fill="currentColor"
                  />
                </svg>
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

          <div>
            <!-- TODO: add logic -->
            <button class="btn btn--icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="icon--favorite"
                :class="isFavorite ? 'on' : 'off'"
              >
                <path
                  d="M22.9178 9.15819C22.8373 8.9703 22.7299 8.82267 22.5823 8.70188C22.4346 8.5811 22.2468 8.50057 21.9918 8.44689L15.523 7.88322L12.9998 1.91097C12.9059 1.68282 12.7583 1.50835 12.5838 1.40098C12.2349 1.19967 11.7651 1.19967 11.4162 1.40098C11.2283 1.50835 11.0941 1.68282 11.0002 1.91097L8.47705 7.88322L1.98139 8.44689C1.75324 8.48715 1.56535 8.56768 1.41772 8.70188C1.28351 8.82267 1.16273 8.9703 1.0822 9.15819C0.988257 9.3595 0.974836 9.57423 1.04194 9.80239C1.10904 10.0171 1.22983 10.205 1.4043 10.3392L6.30288 14.5936L4.8266 20.8745C4.74607 21.1161 4.75949 21.3577 4.85344 21.5724C4.94738 21.7737 5.08159 21.9348 5.26948 22.0421C5.43053 22.1495 5.61842 22.2032 5.79289 22.23C5.81973 22.23 5.86 22.23 5.88684 22.23C6.04789 22.23 6.22236 22.1898 6.42367 22.0824L11.9933 18.7138L17.5898 22.0958C17.8045 22.2032 18.0058 22.2434 18.2071 22.2166C18.395 22.1898 18.5695 22.1361 18.7305 22.0287C18.905 21.9213 19.0526 21.7603 19.1466 21.559C19.2405 21.3442 19.2539 21.1027 19.1734 20.8879L17.6971 14.5802L22.5957 10.3258C22.7836 10.1782 22.9044 9.99028 22.9581 9.77554C23.0252 9.54739 23.0117 9.33266 22.9178 9.13135V9.15819ZM8.6381 13.842L4.62529 10.3392L9.89965 9.86949L11.9933 4.98433L14.0869 9.90975L19.3613 10.3795L15.3485 13.842L16.5429 19.0359L11.9933 16.2578L7.44365 19.009L8.6381 13.842Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <span class="text--expand-menu">{{ $t('assets.favorite') }}</span>
            <q-tooltip>
              <span class="text--tooltip">{{
                $t(isFavorite ? 'assets.removeFromFavorite' : 'assets.addToFavorite')
              }}</span>
            </q-tooltip>
          </div>
        </div>
      </q-slide-transition>
    </div>
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
import { useBreakpoints } from 'src/hooks';
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
    const { width, screenSize } = useBreakpoints();

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

    const isFavorite = ref<boolean>(false);

    return {
      isDisplayToken,
      explorerLink,
      isExpand,
      width,
      screenSize,
      isFavorite,
      buildTransferPageLink,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list-xcm.scss';
</style>
