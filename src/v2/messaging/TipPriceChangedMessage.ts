import { SelectedGas } from '@astar-network/astar-sdk-core';

export class TipPriceChangedMessage {
  constructor(public price: SelectedGas) {}
}
