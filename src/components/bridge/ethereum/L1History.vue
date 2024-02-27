<template>
  <div class="wrapper--l1-history">
    <div v-if="histories.length > 0">
      <div class="box--cards">
        <div v-for="(history, index) in histories" :key="history.tx_hash">
          <div v-if="syncIndex !== index" class="card--history box--hover--active">
            <div class="row--date">
              <div>
                <span class="text--label">{{ displayTime(history.timestamp!) }}</span>
              </div>
              <div v-if="history.isActionRequired">
                <span class="text--error">{{ $t('bridge.actionRequired') }}</span>
              </div>
              <div v-else-if="checkIsRefresh(history)" class="row--sync">
                <button
                  class="icon--sync cursor-pointer"
                  @click="
                    async () => {
                      await handleUpdateHistory(index);
                    }
                  "
                >
                  <astar-icon-sync size="20" />
                </button>
              </div>
            </div>
            <div class="row--summary">
              <div class="summary__row--route">
                <div class="column--chain">
                  <img
                    :src="
                      checkIsL1(history.network_id)
                        ? zkBridgeIcon[l1Network]
                        : zkBridgeIcon[l2Network]
                    "
                    class="icon--chain"
                    alt="from-bridge"
                  />
                  <span class="text--accent">
                    {{ getShortNetworkName(checkIsL1(history.network_id) ? l1Network : l2Network) }}
                  </span>
                </div>
                <div class="icon--arrow-right">
                  <span> → </span>
                </div>
                <div class="column--chain">
                  <img
                    :src="
                      !checkIsL1(history.network_id)
                        ? zkBridgeIcon[l1Network]
                        : zkBridgeIcon[l2Network]
                    "
                    class="icon--chain"
                    alt="from-bridge"
                  />
                  <span class="text--accent">
                    {{
                      getShortNetworkName(!checkIsL1(history.network_id) ? l1Network : l2Network)
                    }}
                  </span>
                </div>
              </div>
              <div>
                <span class="text--accent">
                  <token-balance
                    :balance="ethers.utils.formatUnits(history.amount.toString(), history.decimal)"
                    :symbol="history.symbol ?? ''"
                  />
                </span>
              </div>
            </div>
            <div class="row--record">
              <div class="action-button" :class="checkStatusStyle(history)">
                <span>{{ checkStatus(history) }}</span>
              </div>
              <div class="record__buttons">
                <a
                  :href="
                    getExplorerUrl(
                      checkIsL1(history.network_id) ? l1Network : l2Network,
                      history.tx_hash
                    )
                  "
                  class="action-button link-button"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>
                    {{ getShortNetworkName(checkIsL1(history.network_id) ? l1Network : l2Network) }}
                  </span>
                  <div class="container--explorer-icon">
                    <astar-icon-external-link />
                  </div>
                </a>

                <a
                  v-if="history.claim_tx_hash"
                  :href="
                    getExplorerUrl(
                      !checkIsL1(history.network_id) ? l1Network : l2Network,
                      history.claim_tx_hash
                    )
                  "
                  class="action-button link-button"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>
                    {{
                      getShortNetworkName(!checkIsL1(history.network_id) ? l1Network : l2Network)
                    }}
                  </span>
                  <div class="container--explorer-icon">
                    <astar-icon-external-link />
                  </div>
                </a>
                <button
                  v-else-if="history.isActionRequired"
                  class="action-button link-button status--claim"
                  :disabled="isHandling"
                  @click="async () => await claim(history)"
                >
                  {{ $t('bridge.claim') }}
                </button>
                <div v-else class="link-button" />
              </div>
            </div>
          </div>
          <div v-else>
            <q-skeleton class="skeleton--card" />
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div v-if="isLoadingHistories">{{ $t('common.loading') }}</div>
      <div v-else>{{ $t('bridge.noTransactions') }}</div>
    </div>
  </div>
</template>
<script lang="ts">
import { wait } from '@astar-network/astar-sdk-core';
import { isHex } from '@polkadot/util';
import { ethers } from 'ethers';
import { DateTime } from 'luxon';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { EVM, blockExplorerUrls } from 'src/config/web3';
import { useNetworkInfo } from 'src/hooks';
import {
  BridgeHistory,
  EthBridgeNetworkName,
  checkIsL1,
  zkBridgeIcon,
} from 'src/modules/zk-evm-bridge';
import { useStore } from 'src/store';
import { PropType, defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { getShortNetworkName } from 'src/modules/zk-evm-bridge';

enum TxStatus {
  Completed = 'completed',
  InProgress = 'inProgress',
}

export default defineComponent({
  components: { TokenBalance },
  props: {
    l1Network: {
      type: String,
      required: true,
    },
    l2Network: {
      type: String,
      required: true,
    },
    isLoadingHistories: {
      type: Boolean,
      required: true,
    },
    fetchUserHistory: {
      type: Function,
      required: true,
    },
    handleClaim: {
      type: Function,
      required: true,
    },
    histories: {
      type: Object as PropType<BridgeHistory[]>,
      required: true,
    },
  },
  setup(props) {
    const { nativeTokenSymbol } = useNetworkInfo();
    const { t } = useI18n();
    const store = useStore();
    const isHandling = ref<boolean>(false);
    const syncIndex = ref<number | undefined>();

    const handleUpdateHistory = async (index: number): Promise<void> => {
      try {
        syncIndex.value = index;
        await props.fetchUserHistory();
      } catch (error) {
        console.error(error);
      } finally {
        syncIndex.value = undefined;
      }
    };

    const claim = async (withdrawal: BridgeHistory): Promise<void> => {
      isHandling.value = true;
      const transactionHash = await props.handleClaim(withdrawal);
      if (isHex(transactionHash)) {
        store.commit('general/setLoading', true, { root: true });
        // Memo: gives some time for updating in the bridge API
        await wait(3 * 1000);
        await props.fetchUserHistory();
        store.commit('general/setLoading', false, { root: true });
      }
      isHandling.value = false;
    };

    const displayTime = (timestamp: number): string => {
      return DateTime.fromMillis(Number(timestamp) * 1000).toFormat('HH:mm dd-MMM yyyy');
    };

    const checkIsRefresh = (history: BridgeHistory): boolean => {
      return history.claim_tx_hash === '' && !history.ready_for_claim;
    };

    const checkStatus = (history: BridgeHistory): string => {
      return history.claim_tx_hash !== ''
        ? t(`bridge.${TxStatus.Completed}`)
        : t(`bridge.${TxStatus.InProgress}`);
    };

    const checkStatusStyle = (history: BridgeHistory): string => {
      return history.claim_tx_hash !== '' ? 'status--complete' : 'status--in-progress';
    };

    const getExplorerUrl = (networkName: string, txHash: string) => {
      const txUrl = '/tx/' + txHash;
      switch (networkName) {
        case EthBridgeNetworkName.Ethereum:
          return blockExplorerUrls[EVM.ETHEREUM_MAINNET] + txUrl;
        case EthBridgeNetworkName.Sepolia:
          return blockExplorerUrls[EVM.SEPOLIA_TESTNET] + txUrl;
        case EthBridgeNetworkName.Zkatana:
          return blockExplorerUrls[EVM.ZKATANA_TESTNET] + txUrl;
        case EthBridgeNetworkName.AstarZk:
          return blockExplorerUrls[EVM.SEPOLIA_TESTNET] + txUrl;

        default:
          return blockExplorerUrls[EVM.SEPOLIA_TESTNET] + txUrl;
      }
    };

    return {
      zkBridgeIcon,
      EthBridgeNetworkName,
      ethers,
      nativeTokenSymbol,
      TxStatus,
      syncIndex,
      isHandling,
      displayTime,
      checkIsL1,
      checkStatus,
      checkStatusStyle,
      handleUpdateHistory,
      checkIsRefresh,
      claim,
      getExplorerUrl,
      getShortNetworkName,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/ethereum/styles/l1-history.scss';
</style>
