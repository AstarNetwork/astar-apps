import { container } from 'src/v2/common';
import { Dapp, IDappStakingRepository } from '../logic';
import { Symbols } from 'src/v2/symbols';
import { useNetworkInfo } from 'src/hooks';
import { BusyMessage, IEventAggregator } from 'src/v2/messaging';

export function useDapps() {
  const { currentNetworkName } = useNetworkInfo();

  const getDapps = async (): Promise<Dapp[]> => {
    const repository = container.get<IDappStakingRepository>(Symbols.DappStakingRepositoryV3);
    const aggregator = container.get<IEventAggregator>(Symbols.EventAggregator);

    try {
      aggregator.publish(new BusyMessage(true));
      return await repository.getDapps(currentNetworkName.value.toLowerCase());
    } finally {
      aggregator.publish(new BusyMessage(false));
    }
  };

  return { getDapps };
}
