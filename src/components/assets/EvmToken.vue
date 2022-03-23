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
          <div class="column--asset-buttons column--buttons--multi">
            <button
              class="btn btn--sm bg--astar color--astar"
              @click="
                handleModalTransfer({
                  isOpen: true,
                  currency: token.symbol === tokenSymbol ? tokenSymbol : token,
                })
              "
            >
              {{ $t('assets.transfer') }}
            </button>
            <!-- Memo: temporary -->
            <router-link to="/bridge">
              <button class="btn btn--sm bg--astar color--astar">
                {{ $t('assets.bridge') }}
              </button>
            </router-link>

            <button v-if="isFaucet" class="btn btn--sm bg--astar color--astar">
              {{ $t('assets.faucet') }}
            </button>
            <button
              v-if="isErc20"
              class="btn btn--sm bg--astar color--astar"
              @click="
                addToEvmWallet({
                  tokenAddress: token.address,
                  symbol: token.symbol,
                  decimals: token.decimal,
                  image: getIcon({ symbol: token.symbol, icon: token.icon }),
                })
              "
            >
              {{ $t('add') }}
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
import { addToEvmWallet } from 'src/hooks/helper/wallet';

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
    isErc20: {
      type: Boolean,
      required: true,
    },
    handleModalTransfer: {
      type: Function,
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
      addToEvmWallet,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
