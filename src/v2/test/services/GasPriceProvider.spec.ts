import 'reflect-metadata';
import { container, cid, resetContainer } from 'inversify-props';
import { GasPriceChangedMessage, IEventAggregator, TipPriceChangedMessage } from 'src/v2/messaging';
import { IGasPriceProvider } from 'src/v2/services';
import { initTestContainer } from '../helpers';

describe('GasPriceProvide.ts', () => {
  beforeEach(() => {
    resetContainer();
    initTestContainer();
  });

  it('provides a valid gas price', () => {
    const eventAggregator = container.get<IEventAggregator>(cid.IEventAggregator);
    const gasPriceProvider = container.get<IGasPriceProvider>(cid.IGasPriceProvider);

    eventAggregator.publish(
      new GasPriceChangedMessage({
        speed: 'fast',
        price: '1',
      })
    );
    const gas = gasPriceProvider.getGas();

    expect(gas.speed).toStrictEqual('fast');
    expect(gas.price).toStrictEqual('1');
  });

  it('provides a valid tip price', () => {
    const eventAggregator = container.get<IEventAggregator>(cid.IEventAggregator);
    const gasPriceProvider = container.get<IGasPriceProvider>(cid.IGasPriceProvider);

    eventAggregator.publish(
      new TipPriceChangedMessage({
        speed: 'slow',
        price: '11',
      })
    );
    const gas = gasPriceProvider.getTip();

    expect(gas.speed).toStrictEqual('slow');
    expect(gas.price).toStrictEqual('11');
  });
});
