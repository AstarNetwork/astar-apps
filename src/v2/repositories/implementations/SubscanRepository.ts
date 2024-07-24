import { Guard } from 'src/v2/common';
import { ISubscanRepository, SubscanEvent, SubscanEventResponse } from '../ISubscanRepository';
import { injectable } from 'inversify';
import axios from 'axios';

type Network = 'astar' | 'shiden' | 'shibuya';

@injectable()
export class SubscanRepository implements ISubscanRepository {
  public async getEvents(
    network: Network,
    module: string,
    eventName: string,
    page = 0,
    pageSize = 100
  ): Promise<SubscanEventResponse> {
    Guard.ThrowIfUndefined(network, 'network');
    Guard.ThrowIfUndefined(module, 'module');
    Guard.ThrowIfUndefined(eventName, 'eventName');

    const payload = {
      module,
      event_id: eventName,
      page,
      row: pageSize,
    };
    const url = `${this.getUrl(network)}scan/events`;
    const result = await axios.post(url, payload);
    if (result.status !== 200 && result.data.code !== 0) {
      throw new Error(
        `Failed to get events. Response status: ${result.status}, code: ${result.data.code}`
      );
    }

    const { data } = result.data;
    return {
      count: data.count,
      events: data.events.map((item: any) => {
        return {
          block: Number(item.event_index.split('-')[0]),
          eventIndex: item.event_index,
          moduleId: item.module_id,
          eventId: item.event_id,
          extrinsicHash: item.extrinsic_hash,
          blockTimestamp: item.block_timestamp,
          finalized: item.finalized,
        } as SubscanEvent;
      }),
    };
  }

  private getUrl(network: Network): string {
    if (network !== 'astar' && network !== 'shiden' && network !== 'shibuya') {
      throw new Error(`Network ${network} is not supported.`);
    }

    return `https://${network}.api.subscan.io/api/v2/`;
  }
}
