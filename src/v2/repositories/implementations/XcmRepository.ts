import { u8aToString, BN } from '@polkadot/util';
import { QueryableStorageMultiArg } from '@polkadot/api/types';
import { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import { Option } from '@polkadot/types';
import Web3 from 'web3';
import { Asset, AssetMetadata } from 'src/v2/models';
import { IXcmRepository } from 'src/v2/repositories';
import { injectable, inject } from 'inversify';
import { IApi } from 'src/v2/integration';
import { Symbols } from 'src/v2/symbols';
import { Guard } from 'src/v2/common';

@injectable()
export class XcmRepository implements IXcmRepository {
  constructor(@inject(Symbols.Api) private api: IApi) {}

  public async getAssets(currentAccount: string): Promise<Asset[]> {
    Guard.ThrowIfUndefined('currentAccount', currentAccount);

    const mappedXC20Asset = (assetId: string) => `0xffffffff${Web3.utils.toHex(assetId).slice(2)}`;
    const api = await this.api.getApi();
    const metadata = await api.query.assets.metadata.entries();

    let result: Asset[] = [];
    metadata.forEach(([key, value]) => {
      const id = key.args.map((x) => x.toString())[0];
      const deposit = value.deposit.toBn();
      const name = u8aToString(value.name);
      const symbol = u8aToString(value.symbol);
      const decimals = value.decimals.toNumber();
      const isFrozen = value.isFrozen.valueOf();

      const metadata = new AssetMetadata(name, symbol, decimals, isFrozen, deposit);
      const asset = new Asset(id, mappedXC20Asset(id), metadata);

      result.push(asset);
    });

    result = await this.getBalances(currentAccount, result);

    return result;
  }

  private async getBalances(address: string, assets: Asset[]): Promise<Asset[]> {
    const queries: QueryableStorageMultiArg<'promise'>[] = [];
    const api = await this.api.getApi();

    // Build and issue multi query request
    assets.map((x) => queries.push([api.query.assets.account, [new BN(x.id), address]]));
    const balancesOption = await api.queryMulti<Option<PalletAssetsAssetAccount>[]>(queries);

    balancesOption.map((x, index) => {
      if (x.isSome) {
        const balance = x.unwrap();
        assets[index].balance = balance.balance.toBn();
        assets[index].userBalance = balance.balance.toString();
      }
    });

    return assets.sort((a1, a2) => a2.balance.sub(a1.balance).toNumber());
  }
}
