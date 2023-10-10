import { inject, injectable } from 'inversify';
import { IdentityData } from 'src/v2/models';
import { Symbols } from 'src/v2/symbols';
import { IWalletService } from '../IWalletService';
import { IIdentityRepository } from 'src/v2/repositories';

@injectable()
export class IdentityService {
  constructor(
    @inject(Symbols.WalletFactory) readonly walletFactory: () => IWalletService,
    @inject(Symbols.IdentityRepository) readonly identityRepository: IIdentityRepository
  ) {}

  public async setIdentity(address: string, data: IdentityData): Promise<void> {
    const wallet = this.walletFactory();
    const payload = await this.identityRepository.getSetIdentityCall(address, data);
    await wallet.signAndSend({
      extrinsic: payload,
      senderAddress: address,
    });
  }
}
