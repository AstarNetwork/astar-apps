<template>
  <div v-if="isLoadingNetwork || 0 >= zkNetworkStatuses.length">
    <q-skeleton class="skeleton--value-panel is-zk-evm" />
  </div>
  <div v-else class="wrapper--value" data-testid="network-statuses">
    <div class="container container--value">
      <div class="row--title">
        <span class="text--accent container--title--color">
          {{ $t('dashboard.network.zkEVMNetworkStatuses') }}
        </span>
      </div>
      <div class="box--statuses">
        <div class="row--network-statuses">
          <div v-for="(network, index) in zkNetworkStatuses" :key="index" class="row--network">
            <div v-if="network" class="column--network-name">
              <div>
                <span class="text--accent">{{ network.name }}</span>
              </div>
              <div>
                <span class="text--label-small">
                  {{ $t('dashboard.network.updatedAgo', { time: network.timeAgo }) }}
                </span>
              </div>
            </div>
            <div
              v-if="network"
              class="column--status"
              :class="
                network.status === NetworkStatus.Working ? 'status--success' : 'status--fixing'
              "
            >
              <span>{{ $t(`common.status.${network.status}`) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, Ref, watchEffect } from 'vue';
import { DateTime } from 'luxon';
import Web3 from 'web3';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';

enum NetworkStatus {
  Working = 'working',
  Fixing = 'fixing',
  Restricted = 'restricted',
}

interface INetworkStatus {
  name: string;
  status: string;
  timeAgo: string;
}

export default defineComponent({
  setup() {
    const isLoadingNetwork = ref<boolean>(false);
    const astarZkEvmStatus = ref<INetworkStatus>();
    const zKyotoStatus = ref<INetworkStatus>();

    const getTimeAndStatus = (blockTime: DateTime): { timeAgo: string; status: NetworkStatus } => {
      const currentTime = DateTime.local();
      const diff = currentTime.diff(blockTime);
      // Memo: if the difference is longer than 2mins, it's `fixing`
      const status = diff.as('seconds') < 120 ? NetworkStatus.Working : NetworkStatus.Fixing;
      const timeAgo =
        diff.as('seconds') < 60
          ? `${Math.round(diff.as('seconds'))}s`
          : diff.as('minutes') < 60
          ? `${Math.round(diff.as('minutes'))}m`
          : `${Math.round(diff.as('hours'))}h`;
      return { timeAgo, status };
    };

    const setEvmStatus = async (
      networkRef: Ref,
      networkKey: endpointKey,
      postfix?: string
    ): Promise<void> => {
      const chainEndpoint = providerEndpoints.find((it) => networkKey === it.key)!;
      let name = chainEndpoint.displayName.replace(/Network/g, '');

      if (!name.startsWith('Astar')) {
        name = 'Astar ' + name;
      }

      if (postfix) {
        name += ` (${postfix})`;
      }

      try {
        const web3 = new Web3(chainEndpoint.evmEndpoints[0]);
        const latestBlock = await web3.eth.getBlock('latest');
        const blockTime = DateTime.fromSeconds(Number(latestBlock.timestamp));
        const { status, timeAgo } = getTimeAndStatus(blockTime);

        networkRef.value = {
          name,
          status,
          timeAgo,
        };
      } catch (error) {
        console.error(error);
        networkRef.value = {
          name,
          status: NetworkStatus.Fixing,
          timeAgo: '0s',
        };
      }
    };

    const zkNetworkStatuses = computed<(INetworkStatus | undefined)[]>(() => [
      astarZkEvmStatus.value,
      zKyotoStatus.value,
    ]);

    watchEffect(async () => {
      isLoadingNetwork.value = true;
      await Promise.all([
        await setEvmStatus(astarZkEvmStatus, endpointKey.ASTAR_ZKEVM),
        await setEvmStatus(zKyotoStatus, endpointKey.ZKYOTO, 'testnet'),
      ]);
      isLoadingNetwork.value = false;
    });

    return {
      zkNetworkStatuses,
      isLoadingNetwork,
      NetworkStatus,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/network-status.scss';
</style>
