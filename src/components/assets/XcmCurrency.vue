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
          <div class="text--label">{{ token.metadata.name }}</div>
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
      <div>
        <router-link :to="buildTransferPageLink(token.metadata.symbol)">
          <button class="btn icon-button">
            <!-- TODO: need to create a new icon in AstarUI -->
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9.05025 14.6777L14 22.4558L20.364 3.36396L1.27208 9.72792L9.05025 14.6777ZM9.05025 14.6777L14.7071 9.02082"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </router-link>
        <q-tooltip>
          <span class="text--tooltip">{{ $t('assets.send') }}</span>
        </q-tooltip>
      </div>
      <div>
        <a class="box--explorer" :href="explorerLink" target="_blank" rel="noopener noreferrer">
          <button class="btn icon-button icon-external-link">
            <astar-icon-external-link />
          </button>
        </a>
        <q-tooltip>
          <span class="text--tooltip">{{ $t('subscan') }}</span>
        </q-tooltip>
      </div>
      <div>
        <!-- TODO:
          class name "off" -> add to favorite
          class name "on" -> remove from favorite
        -->
        <button
          class="btn icon-button icon-favorite off"
          @click="console.log('TODO: add to / remove from favorite action')"
        >
          <span>
            <!-- TODO: need to create a new icon in AstarUI -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </span>
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
            <!-- TODO:
              class name "off" -> add to favorite
              class name "on" -> remove from favorite
            -->
            <button
              class="btn icon-button icon-favorite off"
              @click="console.log('TODO: add to / remove from favorite action')"
            >
              <span>
                <!-- TODO: need to create a new icon in AstarUI -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
              </span>
            </button>
            <a :href="explorerLink" target="_blank" rel="noopener noreferrer">
              <button class="btn icon-button icon-external-link">
                <astar-icon-external-link />
              </button>
            </a>
          </div>
          <div class="text-buttons">
            <router-link :to="buildTransferPageLink(token.metadata.symbol)">
              <button class="btn btn--sm">
                {{ $t('assets.send') }}
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
