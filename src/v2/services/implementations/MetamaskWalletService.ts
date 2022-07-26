import { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { IWalletService } from 'src/v2/services';
// import { useEthProvider } from 'src/hooks/custom-signature/useEthProvider';
import { EthereumProvider } from 'src/hooks/types/CustomSignature';
import { inject, injectable } from 'inversify';
import { IEthCallRepository, ISystemRepository } from 'src/v2/repositories';
import { Guard } from 'src/v2/common';
import { WalletService } from 'src/v2/services/implementations';
import { BusyMessage, ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';
import Web3 from 'web3';
import { Symbols } from 'src/v2/symbols';
import { getEvmProvider } from 'src/hooks/helper/wallet';

@injectable()
export class MetamaskWalletService extends WalletService implements IWalletService {
  private provider!: EthereumProvider;

  constructor(
    @inject(Symbols.SystemRepository) private systemRepository: ISystemRepository,
    @inject(Symbols.EthCallRepository) private ethCallRepository: IEthCallRepository,
    @inject(Symbols.EventAggregator) eventAggregator: IEventAggregator,
    @inject(Symbols.CurrentWallet) private currentWallet: string
  ) {
    super(eventAggregator);

    const ethProvider = getEvmProvider(currentWallet as any);

    if (ethProvider) {
      this.provider = ethProvider;
    } else {
      Guard.ThrowIfUndefined('provider', this.provider);
    }
  }

  public async signAndSend(
    extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>,
    senderAddress: string,
    successMessage?: string
  ): Promise<void> {
    Guard.ThrowIfUndefined('extrinsic', extrinsic);
    Guard.ThrowIfUndefined('senderAddress', senderAddress);

    try {
      const account = await this.systemRepository.getAccountInfo(senderAddress);
      const payload = await this.ethCallRepository.getPayload(extrinsic, account.nonce);

      const web3 = new Web3(this.provider as any);
      const accounts = await web3.eth.getAccounts();

      const signedPayload = await this.provider.request({
        method: 'personal_sign',
        params: [accounts[0], payload],
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
            this.eventAggregator.publish(
              new ExtrinsicStatusMessage(
                true,
                successMessage ?? 'Transaction successfully executed',
                `${extrinsic.method.section}.${extrinsic.method.method}`
              )
            );
          }

          this.eventAggregator.publish(new BusyMessage(false));
        } else {
          this.eventAggregator.publish(new BusyMessage(true));
        }
      });
    } catch (e) {
      const error = e as unknown as Error;
      this.eventAggregator.publish(new ExtrinsicStatusMessage(false, error.message));
      this.eventAggregator.publish(new BusyMessage(false));
    }
  }
}
