import { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { IWalletService } from 'src/v2/services';
import { useEthProvider } from 'src/hooks/custom-signature/useEthProvider';
import { EthereumProvider } from 'src/hooks/types/CustomSignature';
import { inject, injectable } from 'inversify-props';
import { IEthCallRepository, ISystemRepository } from 'src/v2/repositories';
import { Guard } from 'src/v2/common';
import { WalletService } from 'src/v2/services/implementations';
import { BusyMessage, ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';

@injectable()
export class MetamaskWalletService extends WalletService implements IWalletService {
  private provider!: EthereumProvider;

  constructor(
    @inject() private systemRepository: ISystemRepository,
    @inject() private ethCallRepository: IEthCallRepository,
    @inject() eventAggregator: IEventAggregator
  ) {
    super(eventAggregator);
    const { ethProvider } = useEthProvider();

    if (ethProvider.value) {
      this.provider = ethProvider.value;
    } else {
      Guard.ThrowIfUndefined('provider', this.provider);
    }
  }

  public async signAndSend(
    extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>,
    senderAddress: string
  ): Promise<void> {
    Guard.ThrowIfUndefined('extrinsic', extrinsic);
    Guard.ThrowIfUndefined('senderAddress', senderAddress);

    try {
      const account = await this.systemRepository.getAccountInfo(senderAddress);
      const payload = this.ethCallRepository.getPayload(extrinsic, account.nonce, 0xff51);

      const signedPayload = await this.provider.request({
        method: 'personal_sign',
        params: ['0xe42A2ADF3BEe1c195f4D72410421ad7908388A6a', payload],
      });

      const call = await this.ethCallRepository.getCall(
        extrinsic,
        senderAddress,
        signedPayload as string,
        account.nonce
      );

      await call.send((result) => {
        if (result.isFinalized) {
          if (!this.isExtrinsicFailed(result.events)) {
            this.eventAggregator.publish(new ExtrinsicStatusMessage(true, 'Success'));
          }

          this.eventAggregator.publish(new BusyMessage(false));
        } else {
          this.eventAggregator.publish(new BusyMessage(true));
        }
      });
    } catch (e) {}
  }
}
