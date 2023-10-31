import { computed } from 'vue';
import { container } from 'src/v2/common';
import { DappBase, IDappStakingRepository, IDappStakingService } from '../logic';
import { Symbols } from 'src/v2/symbols';
import { useNetworkInfo } from 'src/hooks';
import { BusyMessage, IEventAggregator } from 'src/v2/messaging';
import { useStore } from 'src/store';

export function useDapps() {
  const store = useStore();
  const { currentNetworkName } = useNetworkInfo();
  const registeredDapps = computed<DappBase[]>(() => store.getters['stakingV3/getRegisteredDapps']);

  const fetchDappsToStore = async (): Promise<void> => {
    const service = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
    const aggregator = container.get<IEventAggregator>(Symbols.EventAggregator);

    try {
      aggregator.publish(new BusyMessage(true));
      const dApps = await service.getDapps(currentNetworkName.value.toLowerCase());
      store.commit('stakingV3/addDapps', dApps);
    } finally {
      aggregator.publish(new BusyMessage(false));
    }
  };

  const fetchDappToStore = async (dappAddress: string): Promise<void> => {
    const repository = container.get<IDappStakingRepository>(Symbols.DappStakingRepositoryV3);
    const aggregator = container.get<IEventAggregator>(Symbols.EventAggregator);

    try {
      aggregator.publish(new BusyMessage(true));
      const dapp = await repository.getDapp(currentNetworkName.value.toLowerCase(), dappAddress);
      store.commit('stakingV3/updateDappExtended', dapp);
    } finally {
      aggregator.publish(new BusyMessage(false));
    }
  };

  const unstake = async (dappAddress: string, amount: number): Promise<void> => {
    console.log(`Unstaking ${amount} from ${dappAddress}`);
  };

  return { registeredDapps, fetchDappsToStore, fetchDappToStore, unstake };
}
