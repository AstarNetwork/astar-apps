import { SelectedGas } from 'src/modules/gas-api';

export class GasPriceChangedMessage {
  constructor(public price: SelectedGas) {}
}

export class TipPriceChangedMessage {
  constructor(public price: SelectedGas) {}
}
