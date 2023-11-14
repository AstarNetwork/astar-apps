import { u8aToString, BN } from '@polkadot/util';
import { QueryableStorageMultiArg } from '@polkadot/api/types';
import { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import { Option, Struct } from '@polkadot/types';
import Web3 from 'web3';
import { Asset, AssetMetadata } from 'src/v2/models';
import { IXcmRepository } from 'src/v2/repositories';
import { injectable, inject } from 'inversify';
import { ExtrinsicPayload, IApi, IApiFactory } from 'src/v2/integration';
import { Symbols } from 'src/v2/symbols';
import { Guard } from 'src/v2/common';
import {
  getPubkeyFromSS58Addr,
  isValidAddressPolkadotAddress,
  isValidEvmAddress,
} from '@astar-network/astar-sdk-core';
import { XcmTokenInformation } from 'src/modules/xcm';
import { decodeAddress, evmToAddress } from '@polkadot/util-crypto';
import { TokenId } from 'src/v2/config/types';
import { Chain, XcmChain } from 'src/v2/models/XcmModels';
import { FrameSystemAccountInfo } from 'src/v2/repositories/implementations/SystemRepository';

interface AssetConfig extends Struct {
  v1: {
    parents: number;
    interior: Interior;
  };
}

interface Interior {
  x2: X2[];
}

interface X2 {
  parachain: number;
  generalKey: string;
}

export const ASTAR_ADDRESS_PREFIX = 5;

@injectable()
export class XcmRepository implements IXcmRepository {
  // Ids of Astar tokens on foreign network. To be initialized in iherited class.
  protected astarTokens: TokenId;

  constructor(
    @inject(Symbols.DefaultApi) protected api: IApi,
    @inject(Symbols.ApiFactory) protected apiFactory: IApiFactory,
    @inject(Symbols.RegisteredTokens) private registeredTokens: XcmTokenInformation[]
  ) {
    this.astarTokens = {};
  }

  public async getAssets(currentAccount: string): Promise<Asset[]> {
    Guard.ThrowIfUndefined('currentAccount', currentAccount);

    const api = await this.api.getApi();
    const metadata = await api.query.assets.metadata.entries();

    let result: Asset[] = [];
    if (metadata.length > 0) {
      metadata.forEach(([key, value]) => {
        const id = key.args.map((x) => x.toString())[0];
        const deposit = value.deposit.toString();
        const name = u8aToString(value.name);
        const symbol = u8aToString(value.symbol);
        const decimals = value.decimals.toNumber();
        const isFrozen = value.isFrozen.valueOf();
        const metadata = new AssetMetadata(name, symbol, decimals, isFrozen, deposit);
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
    }

    return result;
  }

  public getXcmVersion(from: XcmChain): { version: string; isV3: boolean } {
    // e.g.: [Chain.BIFROST_KUSAMA]
    const v3s: Chain[] = [];
    const version = v3s.find((it) => it === from.name) ? 'V3' : 'V1';
    const isV3 = version === 'V3';
    return { version, isV3 };
  }

  public async getTransferToParachainCall(
    from: XcmChain,
    to: XcmChain,
    recipientAddress: string,
    token: Asset,
    amount: BN,
    endpoint: string
  ): Promise<ExtrinsicPayload> {
    if (!to.parachainId) {
      throw `Parachain id for ${to.name} is not defined`;
    }

    const version = 'V3';
    // the target parachain connected to the current relaychain
    const destination = {
      [version]: {
        interior: {
          X1: {
            Parachain: new BN(to.parachainId),
          },
        },
        parents: new BN(0),
      },
    };

    const recipientAddressId = this.getAddress(recipientAddress);

    const id = decodeAddress(recipientAddressId);
    const AccountId32 = {
      id,
    };

    const beneficiary = {
      [version]: {
        interior: {
          X1: {
            AccountId32,
          },
        },
        parents: new BN(0),
      },
    };

    const assets = {
      [version]: [
        {
          fun: {
            Fungible: amount,
          },
          id: {
            Concrete: {
              interior: 'Here',
              parents: new BN(0),
            },
          },
        },
      ],
    };

    return await this.buildTxCall(
      from,
      endpoint,
      'xcmPallet',
      'reserveTransferAssets',
      destination,
      beneficiary,
      assets,
      new BN(0)
    );
  }

  public async getTransferToOriginChainCall(
    from: XcmChain,
    recipientAddress: string,
    amount: BN,
    endpoint: string
  ): Promise<ExtrinsicPayload> {
    const recipientAccountId = getPubkeyFromSS58Addr(recipientAddress);

    const asset = {
      Concrete: {
        interior: 'Here',
        parents: new BN(1),
      },
    };

    const assets = {
      V3: {
        fun: {
          Fungible: new BN(amount),
        },
        id: asset,
      },
    };

    const destination = {
      V3: {
        interior: {
          X1: {
            AccountId32: {
              id: decodeAddress(recipientAccountId),
            },
          },
        },
        parents: new BN(1),
      },
    };

    const weightLimit = {
      Unlimited: null,
    };

    return await this.buildTxCall(
      from,
      endpoint,
      'xTokens',
      'transferMultiasset',
      assets,
      destination,
      weightLimit
    );
  }

  public getTransferCall(
    from: XcmChain,
    to: XcmChain,
    recipientAddress: string,
    token: Asset,
    amount: BN,
    endpoint: string
  ): Promise<ExtrinsicPayload> {
    throw 'Not implemented.';
  }

  public async getTokenBalance(
    address: string,
    chain: XcmChain,
    token: Asset,
    isNativeToken: boolean,
    endpoint: string
  ): Promise<string> {
    return (await this.getNativeBalance(address, chain, endpoint)).toString();
  }

  public async getNativeBalance(address: string, chain: XcmChain, endpoint: string): Promise<BN> {
    try {
      const api = await this.apiFactory.get(endpoint);
      const { data } = await api.query.system.account<FrameSystemAccountInfo>(address);
      return (data.free.toBn() as BN).sub(new BN(data.miscFrozen ?? data.frozen));
    } catch (e) {
      console.error(e);
      return new BN(0);
    }
  }

  protected async buildTxCall(
    network: XcmChain,
    endpoint: string,
    extrinsic: string,
    method: string,
    ...args: any[]
  ): Promise<ExtrinsicPayload> {
    const api = await this.apiFactory.get(endpoint);
    const call = api.tx[extrinsic][method](...args);
    if (call) {
      return call;
    }

    throw `Undefined extrinsic call ${extrinsic} with method ${method}`;
  }

  protected async fetchAssetConfig(
    source: XcmChain,
    token: Asset,
    endpoint: string
  ): Promise<{
    parents: number;
    interior: Interior;
  }> {
    const api = await this.apiFactory.get(endpoint);
    const config = await api.query.xcAssetConfig.assetIdToLocation<Option<AssetConfig>>(token.id);
    const formattedAssetConfig = JSON.parse(config.toString());
    return formattedAssetConfig.v3;
  }

  protected isAstarNativeToken(token: Asset): boolean {
    return !!this.astarTokens[token.metadata.symbol];
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
        assets[index].balance = balance.balance.toString();
      }
    });

    return assets;
  }

  private getAddress(address: string): string {
    if (isValidAddressPolkadotAddress(address)) {
      return address;
    } else if (isValidEvmAddress(address)) {
      const ss58MappedAddr = evmToAddress(address, ASTAR_ADDRESS_PREFIX);
      const hexPublicKey = getPubkeyFromSS58Addr(ss58MappedAddr);
      return hexPublicKey;
    } else {
      throw `The address ${address} is not valid.`;
    }
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
