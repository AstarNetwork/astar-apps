<template>
  <div v-if="false">
    <q-skeleton class="skeleton--value-panel" />
  </div>
  <div v-else class="wrapper--value">
    <div class="container container--value">
      <div class="row--title">
        <span class="text--accent container--title--color">
          {{ $t('dashboard.network.networkStatuses') }}
        </span>
      </div>
      <div class="box--statuses">
        <div class="row--network-statuses">
          <div v-for="(network, index) in networkStatuses" :key="index" class="row--network">
            <div class="column--network-name">
              <div>
                <span class="text--accent">{{ network.name }}</span>
              </div>
              <div>
                <span class="text--label">
                  {{ $t('dashboard.network.updatedAgo', { time: network.timeAgo }) }}
                </span>
              </div>
            </div>
            <div class="column--status status--success">
              <span>{{ network.status }}</span>
            </div>
          </div>

          <div class="row--network">
            <div class="column--network-name">
              <div>
                <span class="text--accent">dApp Staking</span>
              </div>
            </div>
            <div class="column--status status--success">
              <span>Working</span>
            </div>
          </div>
          <div class="row--network">
            <div class="column--network-name">
              <div>
                <span class="text--accent">XCM</span>
              </div>
            </div>
            <div class="column--status status--success">
              <span>Restricted</span>
            </div>
          </div>
          <div v-if="true" class="container--xcm-restricted">
            <li>XCM withdrawal to Moonbeam network by EVM wallets are temporary disabled</li>
            <li>XCM withdrawal to Moonbeam network by EVM wallets are temporary disabled</li>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  setup(props) {
    const networkStatuses = computed(() => {
      return [
        {
          name: 'Astar Network',
          status: 'Working',
          timeAgo: '30s',
        },
        {
          name: 'Astar Network (EVM)',
          status: 'Working',
          timeAgo: '24s',
        },
        {
          name: 'Shiden Network',
          status: 'Working',
          timeAgo: '24s',
        },
        {
          name: 'Shiden Network (EVM)',
          status: 'Working',
          timeAgo: '24s',
        },
        {
          name: 'Shibuya Network',
          status: 'Working',
          timeAgo: '30s',
        },
        {
          name: 'Shibuya Network (EVM)',
          status: 'Working',
          timeAgo: '24s',
        },
      ];
    });
    return { networkStatuses };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/network-status.scss';
</style>
