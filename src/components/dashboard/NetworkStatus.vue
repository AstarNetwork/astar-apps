<template>
  <div v-if="isLoadingNetwork || 0 >= networkStatuses.length">
    <q-skeleton class="skeleton--value-panel" />
  </div>
  <div v-else class="wrapper--value" data-testid="network-statuses">
    <div class="container container--value">
      <div class="row--title">
        <span class="text--accent container--title--color">
          {{ $t('dashboard.network.networkStatuses') }}
        </span>
      </div>
      <div class="box--statuses">
        <div class="row--network-statuses">
          <div v-for="(network, index) in networkStatuses" :key="index" class="row--network">
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

          <div class="row--network">
            <div class="column--network-name">
              <div>
                <span class="text--accent">{{ $t('common.dappStaking') }}</span>
              </div>
            </div>
            <div
              class="column--status"
              :class="isDappStakingDisabled ? 'status--fixing' : 'status--success'"
            >
              <span>
                {{
                  $t(
                    `common.status.${
                      isDappStakingDisabled ? NetworkStatus.Fixing : NetworkStatus.Working
                    }`
                  )
                }}
              </span>
            </div>
          </div>
          <div class="row--network">
            <div class="column--network-name">
              <div>
                <span class="text--accent">
                  {{ $t('dashboard.network.xcmDepositWithdrawalAssets') }}
                </span>
              </div>
            </div>
            <div
              class="column--status"
              :class="xcmRestrictions.length > 0 ? 'status--restricted' : 'status--success'"
            >
              <span>
                {{
                  $t(
                    `common.status.${
                      xcmRestrictions.length > 0 ? NetworkStatus.Restricted : NetworkStatus.Working
                    }`
                  )
                }}
              </span>
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
import { restrictedXcmNetwork } from 'src/modules/xcm';
import { useNetworkInfo } from 'src/hooks';
import { computed, defineComponent, ref, Ref, watchEffect } from 'vue';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { DateTime } from 'luxon';
import Web3 from 'web3';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { useStore } from 'src/store';
import { useI18n } from 'vue-i18n';

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
    const { currentNetworkChain } = useNetworkInfo();
    const store = useStore();
    const { t } = useI18n();

    const xcmRestrictions = computed<string[]>(() => {
      const restrictedNetworksArray = restrictedXcmNetwork[currentNetworkChain.value] || [];
      return restrictedNetworksArray.length > 0
        ? restrictedNetworksArray.map((it) => {
            const text = it.isRestrictedFromNative ? 'xcmIsDisabled' : 'xcmEvmIsDisabled';
            return t(`assets.transferPage.${text}`, { network: it.chain });
          })
        : [];
    });

    const isDappStakingDisabled = computed<boolean>(
      () => store.getters['dapps/getIsPalletDisabled']
    );

    const isLoadingNetwork = ref<boolean>(false);
    const astarStatus = ref<INetworkStatus>();
    const astarEvmStatus = ref<INetworkStatus>();
    const shidenStatus = ref<INetworkStatus>();
    const shidenEvmStatus = ref<INetworkStatus>();
    const shibuyaStatus = ref<INetworkStatus>();
    const shibuyaEvmStatus = ref<INetworkStatus>();

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

    const setSubstrateStatus = async (networkRef: Ref, networkKey: endpointKey): Promise<void> => {
      const chainEndpoint = providerEndpoints.find((it) => networkKey === it.key)!;
      try {
        const wsProvider = new WsProvider(chainEndpoint.endpoints[0].endpoint);
        const api = await ApiPromise.create({ provider: wsProvider });
        await api.isReady;
        const currentBlockTimestamp = await api.query.timestamp.now();
        const blockTime = DateTime.fromMillis(Number(currentBlockTimestamp));
        const { status, timeAgo } = getTimeAndStatus(blockTime);

        networkRef.value = {
          name: chainEndpoint.displayName,
          status,
          timeAgo,
        };
      } catch (error) {
        console.error(error);
        networkRef.value = {
          name: chainEndpoint.displayName,
          status: NetworkStatus.Fixing,
          timeAgo: '0s',
        };
      }
    };

    const setEvmStatus = async (networkRef: Ref, networkKey: endpointKey): Promise<void> => {
      const chainEndpoint = providerEndpoints.find((it) => networkKey === it.key)!;
      try {
        const web3 = new Web3(chainEndpoint.evmEndpoints[0]);
        const latestBlock = await web3.eth.getBlock('latest');
        const blockTime = DateTime.fromSeconds(Number(latestBlock.timestamp));
        const { status, timeAgo } = getTimeAndStatus(blockTime);

        networkRef.value = {
          name: `${chainEndpoint.displayName} (EVM)`,
          status,
          timeAgo,
        };
      } catch (error) {
        console.error(error);
        networkRef.value = {
          name: `${chainEndpoint.displayName} (EVM)`,
          status: NetworkStatus.Fixing,
          timeAgo: '0s',
        };
      }
    };

    const networkStatuses = computed<(INetworkStatus | undefined)[]>(() => [
      astarStatus.value,
      astarEvmStatus.value,
      shidenStatus.value,
      shidenEvmStatus.value,
      shibuyaStatus.value,
      shibuyaEvmStatus.value,
    ]);

    watchEffect(async () => {
      isLoadingNetwork.value = true;
      await Promise.all([
        await setSubstrateStatus(astarStatus, endpointKey.ASTAR),
        await setSubstrateStatus(shidenStatus, endpointKey.SHIDEN),
        await setSubstrateStatus(shibuyaStatus, endpointKey.SHIBUYA),
        await setEvmStatus(astarEvmStatus, endpointKey.ASTAR),
        await setEvmStatus(shidenEvmStatus, endpointKey.SHIDEN),
        await setEvmStatus(shibuyaEvmStatus, endpointKey.SHIBUYA),
      ]);
      isLoadingNetwork.value = false;
    });

    return {
      networkStatuses,
      xcmRestrictions,
      isLoadingNetwork,
      NetworkStatus,
      isDappStakingDisabled,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/network-status.scss';
</style>
