import { computed } from 'vue';
import { container } from 'src/v2/common';
import {
  CombinedDappInfo,
  DappInfo,
  DappState,
  IDappStakingRepository,
  IDappStakingService,
  TokenApiProviderRepository,
} from '../logic';
import { Symbols } from 'src/v2/symbols';
import { useNetworkInfo } from 'src/hooks';
import { BusyMessage, IEventAggregator } from 'src/v2/messaging';
import { useStore } from 'src/store';

export function useDapps() {
  const store = useStore();
  const { currentNetworkName } = useNetworkInfo();
  const tokenApiProviderRepository = container.get<TokenApiProviderRepository>(
    Symbols.TokenApiProviderRepository
  );

  const registeredDapps = computed<CombinedDappInfo[]>(
    () => store.getters['stakingV3/getRegisteredDapps']
  );
  const allDapps = computed<CombinedDappInfo[]>(() => store.getters['stakingV3/getDapps']);
  const newDapps = computed<DappInfo[]>(() => store.getters['stakingV3/getNewDapps']);

  const fetchDappsToStore = async (): Promise<void> => {
    // Don't fetch if we already have dApps.
    if (registeredDapps.value.length > 0) {
      return;
    }

    console.log('Fetching dapps');
    const service = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
    const aggregator = container.get<IEventAggregator>(Symbols.EventAggregator);

    try {
      aggregator.publish(new BusyMessage(true));
      const dApps = await service.getDapps(currentNetworkName.value.toLowerCase());
      store.commit('stakingV3/addDapps', dApps.fullInfo);
      store.commit('stakingV3/addNewDapps', dApps.chainInfo);
      // Memo: this can a heavy operations since we are querying all dapps stakes for a chain.
      await fetchStakeAmountsToStore();

      const numberOfStakersAndLockers =
        await tokenApiProviderRepository.getNumberOfStakersAndLockers(
          currentNetworkName.value.toLowerCase()
        );
      store.commit('stakingV3/setNumberOfStakersAndLockers', numberOfStakersAndLockers);
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

  const fetchStakeAmountsToStore = async (dappIds: number[] = []): Promise<void> => {
    console.log('Fetching stake amounts');
    const service = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
    const stakeAmounts = await service.getContractStakes(
      dappIds.length > 0 ? dappIds : registeredDapps.value.map((d) => d.chain.id)
    );

    // Update state
    registeredDapps.value.forEach((dapp) => {
      const stake = stakeAmounts.get(dapp.chain.id);
      const chain = { ...dapp.chain };
      if (stake) {
        chain.stakeVoting = stake.voting;
        chain.stakeBuildAndEarn = stake.buildAndEarn;
        chain.totalStake = stake.totalStake;
        store.commit('stakingV3/updateDappChain', chain);
      } else {
        chain.stakeVoting = chain.stakeBuildAndEarn = chain.totalStake = undefined;
      }

      store.commit('stakingV3/updateDappChain', chain);
    });
  };

  const getDapp = (dappAddress: string): CombinedDappInfo | undefined =>
    allDapps.value.find((d) => d.chain.address.toLowerCase() === dappAddress?.toLowerCase());

  const getDappByOwner = (ownerAddress: string): DappInfo | undefined => {
    const dapps = [...allDapps.value.map((x) => x.chain), ...newDapps.value];
    return dapps.find((d) => d.owner === ownerAddress && d.state === DappState.Registered);
  };

  return {
    registeredDapps,
    allDapps,
    fetchDappsToStore,
    fetchDappToStore,
    fetchStakeAmountsToStore,
    getDapp,
    getDappByOwner,
  };
}
