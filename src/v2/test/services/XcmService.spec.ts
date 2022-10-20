import { BN } from '@polkadot/util';
import { container, resetContainer } from 'src/v2/common';
import { Asset, AssetMetadata } from 'src/v2/models';
import { IXcmService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { initTestContainer } from '../helpers';
import { XcmChain } from 'src/v2/models';

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

  describe('transfer', () => {
    const from = {} as XcmChain;
    const to = {} as XcmChain;
    const token = new Asset(
      '1',
      '2',
      new AssetMetadata('Test', 'TST', 10, false, new BN(1000000)),
      '1',
      'Origin',
      '111',
      'image',
      true,
      true,
      0
    );

    it('throws exception if recipient address is empty', async () => {
      const service = container.get<IXcmService>(Symbols.XcmService);

      await expect(
        service.transfer({
          from,
          to,
          token,
          senderAddress: 'sender',
          recipientAddress: '',
          amount: 1,
        })
      ).rejects.toThrow(Error);
    });

    it('throws exception if recipient amount is negative', async () => {
      const service = container.get<IXcmService>(Symbols.XcmService);

      await expect(
        service.transfer({
          from,
          to,
          token,
          senderAddress: 'sender',
          recipientAddress: 'recipient',
          amount: -1,
        })
      ).rejects.toThrow(Error);
    });
  });
});
