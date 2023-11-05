<template>
  <modal-wrapper
    :is-modal-open="isModalSelectToken"
    :title="$t('assets.transferPage.selectToken')"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
    class-name="transfer-modal"
  >
    <div class="container--select-item-mobile">
      <div class="box__column--input-token">
        <div class="box--input-field box--hover--active">
          <input
            :value="importTokenAddress"
            :placeholder="
              $t('bridge.tokenInfo.tokenAddress', {
                network: getShortNetworkName(fromChainName),
              })
            "
            class="input--token"
            @input="(e) => inputImportTokenHandler(e)"
          />
        </div>
      </div>
      <div v-if="!importTokenAddress" class="container--items">
        <div
          v-for="t in tokens"
          :key="t.address"
          class="row--item"
          :class="token.symbol === t.symbol && 'row--item-selected'"
          @click="setToken(t)"
        >
          <div class="column--item-name">
            <img
              v-if="t.symbol === 'ETH'"
              :src="zkBridgeIcon[EthBridgeNetworkName.Sepolia]"
              :alt="t.symbol"
              class="native-token-logo"
            />
            <jazzicon v-else :address="t.address" :diameter="24" class="item-logo" />
            <span class="text--item-name">{{ t.symbol }}</span>
          </div>
          <div class="column--item-name">
            <span class="text--token-amount">
              <token-balance :balance="String(t.fromChainBalance)" :symbol="t.symbol" />
            </span>
          </div>
        </div>
      </div>
      <div v-else>
        <import-token-info
          :import-token-address="importTokenAddress"
          :from-chain-id="fromChainId"
          :from-chain-name="fromChainName"
          :to-chain-name="toChainName"
          :set-zk-tokens="setTokens"
          :tokens="tokens"
        />
      </div>
    </div>
  </modal-wrapper>
</template>
<script lang="ts">
import { truncate } from '@astar-network/astar-sdk-core';
import { fadeDuration } from '@astar-network/astar-ui';
import ImportTokenInfo from 'src/components/bridge/common/ImportTokenInfo.vue';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { useNetworkInfo } from 'src/hooks';
import { EthBridgeNetworkName, ZkToken, zkBridgeIcon } from 'src/modules/zk-evm-bridge';
import { wait } from 'src/v2/common';
import { defineComponent, PropType, ref } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';
import { getShortNetworkName } from 'src/modules/zk-evm-bridge';

export default defineComponent({
  components: {
    ImportTokenInfo,
    ModalWrapper,
    TokenBalance,
    [Jazzicon.name]: Jazzicon,
  },
  props: {
    isModalSelectToken: {
      type: Boolean,
      required: true,
    },
    handleModalSelectToken: {
      type: Function,
      required: true,
    },
    setToken: {
      type: Function,
      required: true,
    },
    tokens: {
      type: Object as PropType<ZkToken[]>,
      required: true,
    },
    token: {
      type: Object as PropType<ZkToken>,
      required: true,
    },
    importTokenAddress: {
      type: String,
      required: true,
    },
    inputImportTokenHandler: {
      type: Function,
      required: true,
    },
    fromChainId: {
      type: Number,
      required: true,
    },
    fromChainName: {
      type: String,
      required: true,
    },
    toChainName: {
      type: String,
      required: true,
    },
    setTokens: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      props.handleModalSelectToken({ isOpen: false });
      isClosingModal.value = false;
    };

    const { nativeTokenSymbol } = useNetworkInfo();

    return {
      nativeTokenSymbol,
      isClosingModal,
      EthBridgeNetworkName,
      zkBridgeIcon,
      closeModal,
      getShortNetworkName,
      truncate,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/ethereum/styles/modal-select-token.scss';
</style>
