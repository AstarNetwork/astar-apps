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
import { isValidAddressPolkadotAddress } from 'src/hooks/helper/plasmUtils';
import { XcmTokenInformation } from 'src/modules/xcm';

@injectable()
export class XcmRepository implements IXcmRepository {
  constructor(
    @inject(Symbols.Api) private api: IApi,
    @inject(Symbols.RegisteredTokens) private registeredTokens: XcmTokenInformation[]
  ) {}

  public async getAssets(currentAccount: string): Promise<Asset[]> {
    Guard.ThrowIfUndefined('currentAccount', currentAccount);

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

      // Todo: get the token data even thought users select `custom-network`
      const registeredData = this.registeredTokens.find((x) => x.assetId === id);
      const minBridgeAmount = registeredData ? registeredData.minBridgeAmount : '0';
      const originChain = registeredData ? registeredData.originChain : '';
      const originAssetId = registeredData ? registeredData.originAssetId : '';
      const tokenImage = registeredData ? (registeredData.logo as string) : 'custom-token';
      const isNativeToken = registeredData ? registeredData.isNativeToken : false;
      const isXcmCompatible = registeredData ? registeredData.isXcmCompatible : false;
      const userBalance = 0;

      const asset = new Asset(
        id,
        this.getMappedXC20Asset(id),
        metadata,
        minBridgeAmount,
        originChain,
        originAssetId,
        tokenImage,
        isNativeToken,
        isXcmCompatible,
        userBalance
      );

      result.push(asset);
    });

    if (isValidAddressPolkadotAddress(currentAccount)) {
      // fetch balances for Substrate accounts only.
      result = await this.getBalances(currentAccount, result);
    }

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
      }
    });

    return assets;
  }

  private getMappedXC20Asset(assetId: string): string {
    const hexedAddress = `0xffffffff${Web3.utils.toHex(assetId).slice(2)}`;
    const requirementLength = 42;
    const mappedLength = hexedAddress.length;
    const paddingDiffer = requirementLength - mappedLength;

    if (paddingDiffer === 0) {
      return hexedAddress;
    } else {
      // Memo: modify the mapped address due to padding issue
      // Memo: -> 0xffffffff
      const a = hexedAddress.slice(0, 10);
      const b = '0'.repeat(paddingDiffer);
      const c = hexedAddress.slice(10);
      const fixedAddress = a + b + c;
      return fixedAddress;
    }
  }
}
