export type SubscanEvent = {
  block: number;
  eventIndex: number;
  moduleId: string;
  eventId: string;
  extrinsicHash: string;
  blockTimestamp: number;
  finalized: boolean;
};

export type SubscanEventResponse = {
  events: SubscanEvent[];
  count: number;
};

/**
 * Definition of repository for access to Subscan API.
 */
export interface ISubscanRepository {
  /**
   * Gets current token price in USD.
   * @param tokenInfo Token information.
   */
  getEvents(
    network: string,
    module: string,
    eventName: string,
    page?: number,
    pageSize?: number
  ): Promise<SubscanEventResponse>;
}
