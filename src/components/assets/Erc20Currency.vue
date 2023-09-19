<template>
  <div class="row" :class="isExpand ? 'is-expand' : ''">
    <div class="row__left" @click="() => (isExpand = !isExpand)">
      <div class="column--currency">
        <div class="token-logo">
          <jazzicon
            v-if="token.image.includes('custom-token')"
            :address="token.address"
            :diameter="24"
          />
          <img v-else :src="token.image" :alt="token.name" />
        </div>
        <div>
          <div class="text--title">{{ token.symbol }}</div>
          <div class="text--label">{{ token.name }}</div>
        </div>
      </div>
      <div class="column--balance">
        <div class="text--title">
          <token-balance :balance="token.userBalance" :symbol="token.symbol" />
        </div>
        <div class="text--label">
          <span>{{ $n(Number(token.userBalanceUsd)) }} {{ $t('usd') }}</span>
        </div>
      </div>
    </div>

    <!-- for desktop -->
    <div class="row__right">
      <div v-if="token.isXC20">
        <router-link :to="buildTransferPageLink(token.symbol)">
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
      <div v-if="token.isWrappedToken && !token.isXC20">
        <a :href="token.wrapUrl" target="_blank" rel="noopener noreferrer">
          <button class="btn icon-button">
            <astar-icon-bridge />
          </button>
        </a>
        <q-tooltip>
          <span class="text--tooltip">{{ $t('assets.wrap') }}</span>
        </q-tooltip>
      </div>

      <div>
        <a class="box--explorer" :href="explorerLink" target="_blank" rel="noopener noreferrer">
          <button class="btn icon-button icon-external-link">
            <astar-icon-external-link />
          </button>
        </a>
        <q-tooltip>
          <span class="text--tooltip">{{ $t('blockscout') }}</span>
        </q-tooltip>
      </div>
      <div>
        <button
          class="btn icon-button icon-plus"
          @click="
            addToEvmProvider({
              tokenAddress: token.address,
              symbol: token.symbol,
              decimals: token.decimal,
              image: token.image,
              provider,
            })
          "
        >
          <div>
            <astar-icon-base>
              <astar-icon-plus />
            </astar-icon-base>
          </div>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.addToWallet') }}</span>
          </q-tooltip>
        </button>
      </div>
      <div v-if="isImportedToken" class="">
        <button
          class="btn btn--sm btn--delete adjuster--width"
          @click="handleDeleteStoredToken(token.address)"
        >
          <div class="adjuster--width icon--delete">
            <astar-icon-delete size="22" />
          </div>
        </button>
        <q-tooltip>
          <span class="text--tooltip">{{ $t('remove') }}</span>
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
          <!-- TODO: need to add a new icon to the AstarUI -->
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
            </button>
            <a class="box--explorer" :href="explorerLink" target="_blank" rel="noopener noreferrer">
              <button>
                <astar-icon-external-link />
              </button>
            </a>
            <button
              @click="
                addToEvmProvider({
                  tokenAddress: token.address,
                  symbol: token.symbol,
                  decimals: token.decimal,
                  image: token.image,
                  provider,
                })
              "
            >
              <div class="icon--plus">
                <span> + </span>
              </div>
            </button>
            <template v-if="isImportedToken">
              <button @click="handleDeleteStoredToken(token.address)">
                <astar-icon-delete size="22" />
              </button>
            </template>
          </div>
          <div class="text-buttons">
            <div v-if="token.isXC20">
              <router-link :to="buildTransferPageLink(token.symbol)">
                <button class="btn btn--sm">
                  {{ $t('assets.send') }}
                </button>
              </router-link>
            </div>
            <div v-if="token.isWrappedToken && !token.isXC20">
              <a :href="token.wrapUrl" target="_blank" rel="noopener noreferrer">
                <button class="btn btn--sm">{{ $t('assets.wrap') }}</button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </q-slide-transition>
  </div>
</template>
<script lang="ts">
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { SupportWallet } from 'src/config/wallets';
import { useNetworkInfo } from 'src/hooks';
import { addToEvmProvider, getEvmProvider } from 'src/hooks/helper/wallet';
import {
  deleteImportedErc20Token,
  Erc20Token,
  getErc20Explorer,
  getStoredERC20Tokens,
} from 'src/modules/token';
import { buildTransferPageLink } from 'src/router/routes';
import { useStore } from 'src/store';
import { computed, defineComponent, PropType, ref } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';
export default defineComponent({
  components: {
    [Jazzicon.name]: Jazzicon,
    TokenBalance,
  },
  props: {
    token: {
      type: Object as PropType<Erc20Token>,
      required: true,
    },
    isXcm: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup({ token }) {
    const store = useStore();
    const { currentNetworkIdx, evmNetworkIdx } = useNetworkInfo();

    const explorerLink = computed(() => {
      const tokenAddress = token.address;
      return getErc20Explorer({ currentNetworkIdx: currentNetworkIdx.value, tokenAddress });
    });

    const isImportedToken = computed<boolean>(
      () =>
        !!getStoredERC20Tokens().find(
          (it) =>
            it.address.toLowerCase() === token.address.toLowerCase() &&
            evmNetworkIdx.value === it.srcChainId
        )
    );

    const currentWallet = computed<SupportWallet>(() => store.getters['general/currentWallet']);
    const provider = getEvmProvider(currentWallet.value);

    const handleDeleteStoredToken = (tokenAddress: string): void => {
      deleteImportedErc20Token({ srcChainId: evmNetworkIdx.value, tokenAddress });
      window.dispatchEvent(new CustomEvent(LOCAL_STORAGE.EVM_TOKEN_IMPORTS));
    };

    const isExpand = ref<boolean>(false);

    return {
      explorerLink,
      isImportedToken,
      provider,
      buildTransferPageLink,
      addToEvmProvider,
      handleDeleteStoredToken,
      isExpand,
    };
  },
});
</script>

<style lang="scss" scoped>
// @use 'src/components/assets/styles/asset-list.scss';
@use 'src/components/assets/styles/asset-list-xcm.scss';
</style>
