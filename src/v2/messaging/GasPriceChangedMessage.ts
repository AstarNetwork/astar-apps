import { SelectedGas } from '@astar-network/astar-sdk-core';

export class GasPriceChangedMessage {
  constructor(public price: SelectedGas) {}
}

export class TipPriceChangedMessage {
  constructor(public price: SelectedGas) {}
}
