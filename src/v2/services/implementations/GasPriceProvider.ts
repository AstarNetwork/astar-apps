import { SelectedGas } from '@astar-network/astar-sdk-core';
import { inject, injectable } from 'inversify';
import { GasPriceChangedMessage, TipPriceChangedMessage, IEventAggregator } from 'src/v2/messaging';
import { IGasPriceProvider } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';

@injectable()
export class GasPriceProvider implements IGasPriceProvider {
  private selectedGas: SelectedGas = { speed: 'average', price: '0' };
  private selectedTip: SelectedGas = { speed: 'average', price: '0' };

  constructor(@inject(Symbols.EventAggregator) private readonly eventAggregator: IEventAggregator) {
    this.eventAggregator.subscribe(GasPriceChangedMessage.name, (m) => {
      const message = m as GasPriceChangedMessage;
      this.selectedGas = message.price;
    });

    this.eventAggregator.subscribe(TipPriceChangedMessage.name, (m) => {
      const message = m as TipPriceChangedMessage;
      this.selectedTip = message.price;
    });
  }

  getGas(): SelectedGas {
    return this.selectedGas;
  }
  getTip(): SelectedGas {
    return this.selectedTip;
  }
}
