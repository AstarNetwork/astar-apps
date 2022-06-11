import { inject, injectable } from 'inversify-props';
import { SelectedGas } from 'src/modules/gas-api';
import { GasPriceChangedMessage, TipPriceChangedMessage, IEventAggregator } from 'src/v2/messaging';
import { IGasPriceProvider } from 'src/v2/services';

@injectable()
export class GasPriceProvider implements IGasPriceProvider {
  private selectedGas: SelectedGas = { speed: 'average', price: '0' };
  private selectedTip: SelectedGas = { speed: 'average', price: '0' };

  constructor(@inject() private readonly eventAggregator: IEventAggregator) {
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
