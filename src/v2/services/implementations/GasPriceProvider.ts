import { SelectedGas } from '@astar-network/astar-sdk-core';
import { inject, injectable } from 'inversify';
import { TipPriceChangedMessage, IEventAggregator } from 'src/v2/messaging';
import { IGasPriceProvider } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';

@injectable()
export class GasPriceProvider implements IGasPriceProvider {
  private selectedTip: SelectedGas = { speed: 'average', price: '0' };

  constructor(@inject(Symbols.EventAggregator) private readonly eventAggregator: IEventAggregator) {
    this.eventAggregator.subscribe(TipPriceChangedMessage.name, (m) => {
      const message = m as TipPriceChangedMessage;
      if (message.price) {
        this.selectedTip = message.price;
      }
    });
  }

  getTip(): SelectedGas {
    return this.selectedTip;
  }
}
