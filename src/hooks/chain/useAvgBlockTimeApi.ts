import { ref, watch } from 'vue';
import { DateTime } from 'luxon';
import { container } from 'src/v2/common';
import { IDappStakingRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import { IEventAggregator, NewEraMessage } from 'src/v2/messaging';
import { isCustomNetwork, useNetworkInfo } from '../useNetworkInfo';

export const useAvgBlockTimeApi = (network: string) => {
  const etaNextEra = ref<string>('');
  const repository = container.get<IDappStakingRepository>(Symbols.DappStakingRepository);
  const eventAggregator = container.get<IEventAggregator>(Symbols.EventAggregator);
  const { networkNameSubstrate } = useNetworkInfo();

  // Subscribe to era change so new estimation can be fetched.
  eventAggregator.subscribe(NewEraMessage.name, async (m) => {
    await fetchNextEraEta(network);
  });

  // Fetch next era ETA from Token API
  const fetchNextEraEta = async (network: string) => {
    if (!network || isCustomNetwork(network)) return;

    const eta = await repository.getNextEraEta(network);

    etaNextEra.value = DateTime.local()
      .plus(eta * 1000)
      .toFormat('HH:mm dd-MMM');
  };

  watch([networkNameSubstrate], () => {
    fetchNextEraEta(networkNameSubstrate.value.toLowerCase());
  });

  return {
    etaNextEra,
  };
};
