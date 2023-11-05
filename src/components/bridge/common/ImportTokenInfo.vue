<template>
  <div v-if="isTokenNotExists">
    <span>{{ $t('bridge.tokenInfo.invalidTokenAddress') }}</span>
  </div>
  <div v-else-if="isLoadingToken">
    <span>{{ $t('common.loading') }}</span>
  </div>
  <div v-else>
    <div class="container--token-info">
      <div class="row--import-token">
        <div class="column--chain">
          <img width="16" :src="zkBridgeIcon[fromChainName]" class="icon--chain" alt="chain-icon" />
          <span>
            {{
              $t('bridge.tokenInfo.tokenAddress', {
                network: getShortNetworkName(fromChainName),
              })
            }}
          </span>
        </div>
        <div class="column--chain">
          <div>
            <a
              :href="`${getExplorerLink(fromChainName)}/token/${zkToken?.address}`"
              target="_blank"
              rel="noopener noreferrer"
              class="text--link"
            >
              {{ getShortenAddress(zkToken?.address ?? '') }}
            </a>
          </div>
          <div>
            <button
              id="copyAddress"
              type="button"
              class="icon--copy"
              @click="copyAddress(zkToken?.address || '')"
            >
              <astar-icon-copy />
            </button>
          </div>
        </div>
      </div>
      <div class="row--import-token row--to-chain-address">
        <div class="column--chain">
          <img width="16" :src="zkBridgeIcon[toChainName]" alt="chain-icon" />
          <span>
            {{
              $t('bridge.tokenInfo.tokenAddress', {
                network: getShortNetworkName(toChainName),
              })
            }}
          </span>
        </div>
        <div class="column--chain">
          <div>
            <a
              :href="`${getExplorerLink(toChainName)}/token/${zkToken?.toChainTokenAddress}`"
              target="_blank"
              rel="noopener noreferrer"
              class="text--link"
            >
              {{ getShortenAddress(zkToken?.toChainTokenAddress ?? '') }}
            </a>
          </div>
          <div>
            <button
              id="copyAddress"
              type="button"
              class="icon--copy"
              @click="copyAddress(zkToken?.toChainTokenAddress || '')"
            >
              <astar-icon-copy />
            </button>
          </div>
        </div>
      </div>
      <div class="row--import-token">
        <div>
          <span> {{ $t('bridge.tokenInfo.tokenName') }}</span>
        </div>
        <div>
          <span> {{ zkToken?.name }} </span>
        </div>
      </div>
      <div class="row--import-token">
        <div>
          <span> {{ $t('bridge.tokenInfo.tokenSymbol') }}</span>
        </div>
        <div>
          <span> {{ zkToken?.symbol }} </span>
        </div>
      </div>
      <div class="row--import-token">
        <div>
          <span> {{ $t('bridge.tokenInfo.fromChainBal') }}</span>
        </div>
        <div>
          <span>
            <token-balance
              :balance="String(zkToken?.fromChainBalance)"
              :symbol="zkToken?.symbol ?? ''"
            />
          </span>
        </div>
      </div>
      <div class="row--import-token">
        <div>
          <span> {{ $t('bridge.tokenInfo.destChainBal') }}</span>
        </div>
        <div>
          <span>
            <token-balance
              :balance="String(zkToken?.toChainBalance)"
              :symbol="zkToken?.symbol ?? ''"
            />
          </span>
        </div>
      </div>
    </div>
    <div>
      <div class="row--warning">
        <div class="icon--warning">
          <astar-icon-warning size="24" />
        </div>
        <span v-if="isAddedToken" class="text--error">
          <span> {{ $t('bridge.tokenInfo.tokenHasBeenAdded') }}</span>
        </span>
        <span v-else-if="isBlackListToken" class="text--error">
          {{ $t('bridge.tokenInfo.tokenNotSupported') }}
        </span>
        <span v-else class="text--error">{{ $t('bridge.tokenInfo.interactCarefully') }}</span>
      </div>
      <astar-button :disabled="!!isDisabledButton" class="button--confirm" @click="handleAddToken">
        {{ $t('add') }}
      </astar-button>
    </div>
  </div>
</template>
<script lang="ts">
import { getShortenAddress, isValidEvmAddress, truncate } from '@astar-network/astar-sdk-core';
import copy from 'copy-to-clipboard';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { EVM, blockExplorerUrls } from 'src/config/web3';
import { useImportToken } from 'src/hooks';
import {
  EthBridgeNetworkName,
  TOKEN_BLACKLIST,
  ZkToken,
  zkBridgeIcon,
} from 'src/modules/zk-evm-bridge';
import { useStore } from 'src/store';
import { PropType, computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import Jazzicon from 'vue3-jazzicon/src/components';
import { getShortNetworkName } from 'src/modules/zk-evm-bridge';

export default defineComponent({
  components: {
    TokenBalance,
    [Jazzicon.name]: Jazzicon,
  },
  props: {
    importTokenAddress: {
      type: String,
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
    setZkTokens: {
      type: Function,
      required: true,
    },
    tokens: {
      type: Object as PropType<ZkToken[]>,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { t } = useI18n();

    const tokenAddress = computed<string>(() => props.importTokenAddress);
    const isValidAddress = computed<Boolean>(() => isValidEvmAddress(props.importTokenAddress));
    const isTokenNotExists = computed<Boolean>(
      () =>
        !!(props.importTokenAddress && !isValidAddress.value) ||
        !!(props.importTokenAddress && !isLoadingToken.value && !zkToken.value)
    );

    const isAddedToken = computed<Boolean>(() =>
      props.tokens.some((it) => it.address.toLowerCase() === props.importTokenAddress.toLowerCase())
    );

    const isBlackListToken = computed<Boolean>(() =>
      TOKEN_BLACKLIST.some((it) => it.toLowerCase() === props.importTokenAddress.toLowerCase())
    );

    const isDisabledButton = computed<Boolean>(() => isAddedToken.value || isBlackListToken.value);

    const { isLoadingToken, zkToken, storeImportToken } = useImportToken({
      fromChainName: props.fromChainName,
      toChainName: props.toChainName,
      importTokenAddress: tokenAddress,
    });

    const handleAddToken = async (): Promise<void> => {
      await storeImportToken();
      await props.setZkTokens(zkToken.value);
    };

    const getExplorerLink = (chainName: string): string => {
      switch (chainName) {
        case EthBridgeNetworkName.Ethereum:
          return String(blockExplorerUrls[EVM.ETHEREUM_MAINNET][0]);
        case EthBridgeNetworkName.Sepolia:
          return String(blockExplorerUrls[EVM.SEPOLIA_TESTNET][0]);
        case EthBridgeNetworkName.AstarZk:
          return String(blockExplorerUrls[EVM.ASTAR_ZKEVM_MAINNET][0]);
        case EthBridgeNetworkName.Zkatana:
          return String(blockExplorerUrls[EVM.ZKATANA_TESTNET][0]);
        default:
          return String(blockExplorerUrls[EVM.ZKATANA_TESTNET][0]);
      }
    };

    const copyAddress = (address: string): void => {
      copy(address);
      store.dispatch('general/showAlertMsg', {
        msg: t('toast.copyAddressSuccessfully'),
        alertType: 'copied',
      });
    };

    return {
      truncate,
      getShortenAddress,
      isValidAddress,
      isLoadingToken,
      zkToken,
      zkBridgeIcon,
      handleAddToken,
      isTokenNotExists,
      isAddedToken,
      isDisabledButton,
      isBlackListToken,
      getExplorerLink,
      copyAddress,
      getShortNetworkName,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/common/styles/select-token.scss';
</style>
