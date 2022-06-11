import { SelectedGas } from 'src/modules/gas-api';

/**
 * Definition of service used to manage transaction gas price.
 */
export interface IGasPriceProvider {
  getGas(): SelectedGas;

  getTip(): SelectedGas;
}
