import { container, resetContainer } from 'src/v2/common';
import { IXcmService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { initTestContainer } from '../helpers';

describe('XcmService.ts', () => {
  beforeEach(() => {
    resetContainer();
    initTestContainer();
  });

  it('calculated asset USD price', async () => {
    const service = container.get<IXcmService>(Symbols.XcmService);

    const { assets } = await service.getAssets('123', true);

    expect(assets).toBeTruthy();
    expect(assets[0].userBalance).toBeCloseTo(0.001, 3);
    expect(assets[0].userBalanceUsd).toBeCloseTo(0.1, 3);
  });
});
