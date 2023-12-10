import { SelectedGas } from '@astar-network/astar-sdk-core';

/**
 * Definition of service used to manage transaction gas price.
 */
export interface IGasPriceProvider {
  getTip(): SelectedGas;
}
