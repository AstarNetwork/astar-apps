import { computed } from 'vue';
import { container } from 'src/v2/common';
import { DappBase, IDappStakingRepository } from '../logic';
import { Symbols } from 'src/v2/symbols';
import { useNetworkInfo } from 'src/hooks';
import { BusyMessage, IEventAggregator } from 'src/v2/messaging';
import { useStore } from 'src/store';

export function useDapps() {
  const store = useStore();
  const { currentNetworkName } = useNetworkInfo();
  const dappsBasic = computed<DappBase[]>(() => store.getters['stakingV3/getDappsBasic']);

  const fetchDappsToStore = async (): Promise<void> => {
    const repository = container.get<IDappStakingRepository>(Symbols.DappStakingRepositoryV3);
    const aggregator = container.get<IEventAggregator>(Symbols.EventAggregator);

    try {
      aggregator.publish(new BusyMessage(true));
      const dapps = await repository.getDapps(currentNetworkName.value.toLowerCase());
      store.commit(
        'stakingV3/addDapps',
        dapps.map((x) => ({ basic: x }))
      );
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

  const stake = async (dappAddress: string, amount: number): Promise<void> => {
    console.log(`Staking ${amount} to ${dappAddress}`);
  };

  const unstake = async (dappAddress: string, amount: number): Promise<void> => {
    console.log(`Unstaking ${amount} from ${dappAddress}`);
  };

  return { dappsBasic, fetchDappsToStore, fetchDappToStore, stake, unstake };
}
