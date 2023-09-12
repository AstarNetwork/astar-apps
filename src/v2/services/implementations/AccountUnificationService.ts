import { injectable, inject } from 'inversify';
import { Symbols } from 'src/v2/symbols';
import { IWalletService, WalletType, IAccountUnificationService } from 'src/v2/services';
import { IAccountsRepository, ISystemRepository } from 'src/v2/repositories';
import { decodeAddress } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';

@injectable()
export class AccountUnificationService implements IAccountUnificationService {
  constructor(
    @inject(Symbols.WalletFactory)
    private walletFactory: (walletType?: WalletType) => IWalletService,
    @inject(Symbols.SystemRepository) private systemRepo: ISystemRepository,
    @inject(Symbols.AccountsRepository) private accountsRepo: IAccountsRepository
  ) {}

  public async unifyAccounts(ss58Address: string, h160Address: string): Promise<void> {
    const chainId = await this.systemRepo.getChainId();
    const genesisHash = await this.systemRepo.getBlockHash(0);
    const publicKey = u8aToHex(decodeAddress(ss58Address));

    const domain = {
      chainId: chainId,
      name: 'Astar EVM Claim',
      version: '1',
      salt: genesisHash,
    };
    const types = {
      Claim: [{ name: 'substrateAddress', type: 'string' }],
    };
    const value = {
      substrateAddress: publicKey,
    };

    const payload = {
      domain,
      types,
      primaryType: 'Claim',
      message: value,
    };

    const wallet = this.walletFactory(WalletType.Metamask);
    const signedPayload = await wallet.signPayload(payload, h160Address);
    // const signedPayload =
    //   '559c529983f8737c043c81283be69d5a6c9dd0f2df6623d035c25708f7b4e8d057b3168f4bf959c6ed334e9ead59f7d887cdbe99b61a7096256af95b429ab36a1c';
    console.log(signedPayload);
    
    // const transaction = await this.accountsRepo.getClaimEvmAccountCall(
    //   h160Address,
    //   this.hexToBytes(signedPayload)
    // );

    // const wallet = this.walletFactory();

    // await wallet.signAndSend({
    //   extrinsic: transaction,
    //   senderAddress: ss58Address,
    // });
  }

  // this is just temporary as signature is array
  private hexToBytes(hex: string): number[] {
    var bytes = [];

    for (var c = 0; c < hex.length; c += 2) {
      bytes.push(parseInt(hex.substr(c, 2), 16));
    }

    return bytes;
  }
}
