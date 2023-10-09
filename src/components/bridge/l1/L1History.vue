<template>
  <div class="wrapper--l1-history">
    <div v-if="histories.length > 0">
      <div class="box--cards">
        <div v-for="(history, index) in histories" :key="history.tx_hash">
          <div v-if="syncIndex !== index" class="card--history box--hover--active">
            <div class="row--date">
              <div v-if="history.timestamp">
                <span class="text--label">{{ displayTime(history.timestamp) }}</span>
              </div>
              <div v-if="checkIsClaimRequired(history)">
                <span class="text--error">{{ $t('bridge.actionRequired') }}</span>
              </div>
              <div
                v-else-if="
                  checkStatus(history) === $t('bridge.inProgress') && !history.ready_for_claim
                "
              >
                <div class="row--sync">
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
                    {{ checkIsL1(history.network_id) ? l1Network : l2Network }}
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
                    {{ !checkIsL1(history.network_id) ? l1Network : l2Network }}
                  </span>
                </div>
              </div>
              <div>
                <span class="text--accent">
                  <token-balance
                    :balance="ethers.utils.formatEther(history.amount.toString())"
                    :symbol="nativeTokenSymbol"
                  />
                </span>
              </div>
            </div>
            <div class="row--record">
              <div class="action-button" :class="checkStatusStyle(history)">
                <span>{{ checkStatus(history) }}</span>
              </div>
              <div class="record__buttons">
                <a href="/" class="action-button link-button">
                  <span>
                    {{
                      (checkIsL1(history.network_id) ? l1Network : l2Network).replace('zkEVM', '')
                    }}
                  </span>
                  <div class="container--explorer-icon">
                    <astar-icon-external-link />
                  </div>
                </a>

                <a v-if="history.claim_tx_hash" href="/" class="action-button link-button">
                  <span>
                    {{
                      (!checkIsL1(history.network_id) ? l1Network : l2Network).replace('zkEVM', '')
                    }}
                  </span>
                  <div class="container--explorer-icon">
                    <astar-icon-external-link />
                  </div>
                </a>
                <button
                  v-else-if="checkIsClaimRequired(history)"
                  class="action-button link-button status--claim"
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
      <div v-else>{{ $t('bridge.noHistory') }}</div>
    </div>
  </div>
</template>
<script lang="ts">
import { ethers } from 'ethers';
import { DateTime } from 'luxon';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { useNetworkInfo } from 'src/hooks';
import {
  BridgeHistory,
  EthBridgeNetworkName,
  checkIsL1,
  zkBridgeIcon,
} from 'src/modules/zk-evm-bridge';
import { PropType, defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';

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
    histories: {
      type: Object as PropType<BridgeHistory[]>,
      required: true,
    },
  },
  setup(props) {
    const { nativeTokenSymbol } = useNetworkInfo();
    const { t } = useI18n();

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

    const displayTime = (timestamp: number): string => {
      return DateTime.fromMillis(Number(timestamp) * 1000).toFormat('HH:mm dd-MMM yyyy');
    };

    const checkStatus = (history: BridgeHistory): string => {
      return history.claim_tx_hash !== ''
        ? t(`bridge.${TxStatus.Completed}`)
        : t(`bridge.${TxStatus.InProgress}`);
    };

    const checkStatusStyle = (history: BridgeHistory): string => {
      return history.claim_tx_hash !== '' ? 'status--complete' : 'status--in-progress';
    };

    const checkIsClaimRequired = (history: BridgeHistory): boolean => {
      return history.claim_tx_hash === '' && history.ready_for_claim;
    };

    return {
      zkBridgeIcon,
      EthBridgeNetworkName,
      ethers,
      nativeTokenSymbol,
      TxStatus,
      syncIndex,
      displayTime,
      checkIsL1,
      checkStatus,
      checkStatusStyle,
      checkIsClaimRequired,
      handleUpdateHistory,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/l1/styles/l1-history.scss';
</style>
