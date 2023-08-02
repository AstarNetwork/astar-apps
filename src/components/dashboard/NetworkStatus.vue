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
            <div
              class="column--status"
              :class="network.status === 'Working' ? 'status--success' : 'status--fixing'"
            >
              <span>{{ network.status }}</span>
            </div>
          </div>

          <div class="row--network">
            <div class="column--network-name">
              <div>
                <span class="text--accent">{{ $t('common.dappStaking') }}</span>
              </div>
            </div>
            <div class="column--status status--success">
              <span>Working</span>
            </div>
          </div>
          <div class="row--network">
            <div class="column--network-name">
              <div>
                <span class="text--accent">{{ $t('assets.xcm') }}</span>
              </div>
            </div>
            <div
              class="column--status"
              :class="xcmRestrictions.length > 0 ? 'status--restricted' : 'status--success'"
            >
              <span>{{ xcmRestrictions.length > 0 ? 'Restricted' : 'Working' }}</span>
            </div>
          </div>
          <div v-if="xcmRestrictions.length > 0" class="container--xcm-restricted">
            <li v-for="(item, index) in xcmRestrictions" :key="index">{{ item }}</li>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { restrictedNetworks } from 'src/modules/xcm';
import { useNetworkInfo } from 'src/hooks';
import { computed, defineComponent } from 'vue';
export default defineComponent({
  setup(props) {
    const { currentNetworkChain } = useNetworkInfo();

    const xcmRestrictions = computed<string[]>(() => {
      return restrictedNetworks[currentNetworkChain.value] || [];
    });

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
          status: 'Fixing',
          timeAgo: '24s',
        },
      ];
    });
    return { networkStatuses, xcmRestrictions };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/network-status.scss';
</style>
