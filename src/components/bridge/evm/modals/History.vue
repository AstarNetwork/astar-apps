<template>
  <div vue-if="history" class="history-card">
    <div class="history-item">
      <img :src="srcChainIcon" class="history-chain-logo" alt="src-chain-icon" />
      <div class="tx-detail">
        <div class="row-token">
          <img :src="icon" class="token-mini" alt="src-token" />
          <p>{{ srcAmount }} {{ srcToken.symbol }}</p>
        </div>
        <a
          :href="history.src_block_tx_link"
          target="_blank"
          rel="noopener noreferrer"
          class="explorer-link"
        >
          {{ $t('bridge.viewDetails') }}
        </a>
      </div>
    </div>

    <div class="arrow">→</div>

    <div class="history-item">
      <img :src="destChainIcon" class="history-chain-logo" alt="dest-chain-icon" />
      <div class="tx-detail">
        <div class="row-token">
          <img :src="icon" class="token-mini" alt="dest-token" />
          <span class="amount">{{ destAmount }} {{ destToken.symbol }}</span>
        </div>
        <a
          :href="history.dst_block_tx_link"
          target="_blank"
          rel="noopener noreferrer"
          class="explorer-link"
        >
          {{ $t('bridge.viewDetails') }}
        </a>
      </div>
    </div>
    <div class="tx-detail">
      <p>{{ $t(status) }}</p>
      <p>{{ time }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ethers } from 'ethers';
import { formatDecimals, getIcon, getTxStatus } from 'src/c-bridge';
import { DateTime } from 'luxon';

export default defineComponent({
  props: {
    history: {
      type: Object,
      required: true,
    },
    tokenIcons: {
      type: Array,
      required: true,
    },
  },
  setup({ history, tokenIcons }) {
    const srcChainIcon = history.src_send_info.chain.icon;
    const destChainIcon = history.dst_received_info.chain.icon;
    const srcToken = history.src_send_info.token;
    const destToken = history.dst_received_info.token;
    const iconObj = tokenIcons.find((it: any) => it.symbol === destToken.symbol) as {
      symbol: string;
      icon: string;
    };

    const icon = iconObj ? getIcon({ symbol: iconObj.symbol, icon: iconObj.icon }) : '';

    const srcAmount = formatDecimals({
      amount: ethers.utils.formatUnits(history.src_send_info.amount, srcToken.decimal),
      decimals: 3,
    });

    const destAmount = formatDecimals({
      amount: ethers.utils.formatUnits(history.dst_received_info.amount, srcToken.decimal),
      decimals: 3,
    });

    const time = DateTime.fromMillis(Number(history.ts)).toLocal().toFormat('dd-MMM-yy HH:mm');

    const status = `bridge.status.${getTxStatus(history.status)}`;

    return {
      srcChainIcon,
      destChainIcon,
      srcAmount,
      srcToken,
      destAmount,
      destToken,
      time,
      status,
      icon,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '../styles/bridge-modal';
</style>
