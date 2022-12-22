import { container, resetContainer } from 'src/v2/common';
import { Erc20Token } from 'src/modules/token';
import { IXvmService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { initTestContainer } from '../helpers';

describe('XvmService.ts', () => {
  beforeEach(() => {
    resetContainer();
    initTestContainer();
  });

  describe('transfer xvm tokens', () => {
    const token: Erc20Token = {
      address: '0xd9aF35a156FD891de9DcB45f07858eA51ea3A3aC',
      decimal: 18,
      name: 'Hachi',
      srcChainId: 81,
      symbol: 'HACHI',
      userBalance: '100',
      userBalanceUsd: '0',
    };

    const senderAddress = 'axodJWpkSi9E5k7SgewYCCnTMZw3y6n79nuLevTCGFt7ADw';
    const recipientAddress = '0xde53286f1d6c299fb712a3b48239e714ca117b69';
    const finalizedCallback = () => {};

    it('calculated asset USD price', async () => {
      const service = container.get<IXvmService>(Symbols.XvmService);
      const assets = await service.getAssets({
        currentAccount: senderAddress,
        isFetchUsd: false,
        srcChainId: 81,
      });
      expect(assets).toBeTruthy();
      expect(assets.xvmAssets[0].userBalanceUsd).toBe('0');
    });

    it('throws exception if recipient address is empty', async () => {
      const service = container.get<IXvmService>(Symbols.XvmService);
      await expect(
        service.transfer({
          token,
          recipientAddress: '',
          senderAddress,
          amount: '10',
          finalizedCallback,
        })
      ).rejects.toThrow(Error);
    });

    it('throws exception if recipient amount is negative', async () => {
      const service = container.get<IXvmService>(Symbols.XvmService);
      await expect(
        service.transfer({
          token,
          recipientAddress,
          senderAddress,
          amount: '-10',
          finalizedCallback,
        })
      ).rejects.toThrow(Error);
    });
    it('throws exception if users do not have enough balances', async () => {
      const service = container.get<IXvmService>(Symbols.XvmService);
      await expect(
        service.transfer({
          token,
          recipientAddress,
          senderAddress,
          amount: '10000',
          finalizedCallback,
        })
      ).rejects.toThrow(Error);
    });
  });
});
