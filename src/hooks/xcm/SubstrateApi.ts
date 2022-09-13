import { ApiPromise, WsProvider } from '@polkadot/api';
import { Option, Struct, TypeRegistry } from '@polkadot/types';
import { DispatchError } from '@polkadot/types/interfaces';
import { ISubmittableResult, ITuple } from '@polkadot/types/types';
import { decodeAddress } from '@polkadot/util-crypto';
import BN from 'bn.js';
import { ExtrinsicPayload } from 'src/hooks/helper';
import { ExistentialDeposit, fetchExistentialDeposit, parachainIds } from 'src/modules/xcm';
import { idAstarNativeToken } from 'src/modules/xcm/tokens';
import { Asset } from 'src/v2/models';

const AUTO_CONNECT_MS = 10_000; // [ms]

export type AstarToken = 'ASTR' | 'SDN';
export type AstarNativeToken = {
  [key in AstarToken]: string;
};

interface ChainProperty {
  tokenSymbols: string[];
  tokenDecimals: number[];
  chainName: string;
  ss58Prefix: number;
}

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

class BaseApi {
  private _provider?: WsProvider;
  private _api: ApiPromise;
  private _chainProperty: ChainProperty | undefined;
  private _registry: TypeRegistry;

  constructor(api: ApiPromise | null, endpoint?: string) {
    if (api) {
      this._api = api;
    } else {
      this._provider = new WsProvider(endpoint, AUTO_CONNECT_MS);

      console.info('connecting to ' + endpoint);
      this._api = new ApiPromise({
        provider: this._provider,
      });
    }

    this._registry = new TypeRegistry();
  }

  public get apiInst() {
    if (!this._api) {
      throw new Error('The ApiPromise has not been initialized');
    }
    return this._api;
  }

  public get chainProperty() {
    return this._chainProperty;
  }

  public get typeRegistry() {
    return this._registry;
  }

  public async start() {
    this._api = await this._api.isReady;

    const chainProperties = await this._api.rpc.system.properties();

    const ss58Prefix = parseInt((await this._api.consts.system.ss58Prefix).toString() || '0');

    const tokenDecimals = chainProperties.tokenDecimals
      .unwrapOrDefault()
      .toArray()
      .map((i) => i.toNumber());

    const tokenSymbols = chainProperties.tokenSymbol
      .unwrapOrDefault()
      .toArray()
      .map((i) => i.toString());

    const chainName = (await this._api.rpc.system.chain()).toString();

    //console.log(`connected to ${chainName} with account ${this.account.address}`);

    this._chainProperty = {
      tokenSymbols,
      tokenDecimals,
      chainName,
      ss58Prefix,
    };
  }
  public async evmTransferToParachain({
    toPara,
    recipientAccountId,
    amount,
    selectedToken,
  }: {
    toPara: number;
    recipientAccountId: string;
    amount: string;
    selectedToken: Asset;
  }): Promise<string> {
    return '';
  }
  public async getBlockHash(blockNumber: number) {
    return await this._api?.rpc.chain.getBlockHash(blockNumber);
  }

  public async getExistentialDeposit(): Promise<ExistentialDeposit> {
    return await fetchExistentialDeposit(this._api);
  }

  public buildTxCall(extrinsic: string, method: string, ...args: any[]): ExtrinsicPayload {
    const ext = this._api?.tx[extrinsic][method](...args);
    if (ext) return ext;
    throw `Undefined extrinsic call ${extrinsic} with method ${method}`;
  }

  public buildStorageQuery(extrinsic: string, method: string, ...args: any[]) {
    const ext = this._api?.query[extrinsic][method](...args);
    if (ext) return ext;
    throw `Undefined storage query ${extrinsic} for method ${method}`;
  }

  public wrapBatchAll(txs: ExtrinsicPayload[]): ExtrinsicPayload {
    const ext = this._api?.tx.utility.batchAll(txs);
    if (ext) return ext;
    throw 'Undefined batch all';
  }

  public wrapSudo(tx: ExtrinsicPayload): ExtrinsicPayload {
    const ext = this._api?.tx.sudo.sudo(tx);
    if (ext) return ext;
    throw 'Undefined sudo';
  }

  public async getNativeBalance(address: string) {
    try {
      await this._api?.isReady;
      const balData = ((await this._api.query.system.account(address)) as any).data;
      return (balData.free.toBn() as BN).sub(new BN(balData.miscFrozen));
    } catch (e) {
      console.error(e);
      return new BN(0);
    }
  }

  public async getTokenBalances({
    selectedToken,
    address,
    isNativeToken,
  }: {
    selectedToken: Asset;
    address: string;
    isNativeToken: boolean;
  }): Promise<string> {
    try {
      return (await this.getNativeBalance(address)).toString();
    } catch (e) {
      console.error(e);
      return '0';
    }
  }

  public async isReady(): Promise<void> {
    try {
      await this._api?.isReady;
    } catch (e) {
      console.error(e);
    }
  }

  public async signAndSend({
    account,
    signer,
    tx,
    finalizedCallback,
    handleResult,
    tip,
  }: {
    account: string;
    signer: any;
    tx: ExtrinsicPayload;
    finalizedCallback: (hash: string) => Promise<void>;
    handleResult: (result: ISubmittableResult) => Promise<boolean>;
    tip: string;
  }) {
    return new Promise<boolean>(async (resolve) => {
      const txsToExecute: ExtrinsicPayload[] = [];
      txsToExecute.push(tx);
      const transaction = this._api.tx.utility.batch(txsToExecute);
      try {
        // ensure that we automatically increment the nonce per transaction
        await transaction.signAndSend(account, { signer, nonce: -1, tip }, (result) => {
          // console.log('r', result);
          handleResult &&
            handleResult(result).then(async () => {
              const hash = result.txHash.toString();
              await finalizedCallback(hash);
              resolve(true);
            });
          // handle transaction errors
          result.events
            .filter((record): boolean => !!record.event && record.event.section !== 'democracy')
            .map(async ({ event: { data, method, section } }) => {
              if (section === 'system' && method === 'ExtrinsicFailed') {
                const [dispatchError] = data as unknown as ITuple<[DispatchError]>;
                let message = dispatchError.type.toString();

                if (dispatchError.isModule) {
                  try {
                    const mod = dispatchError.asModule;
                    const error = dispatchError.registry.findMetaError(mod);

                    message = `${error.section}.${error.name}`;
                    resolve(false);
                  } catch (error) {
                    console.error(error);
                    resolve(false);
                  }
                } else if (dispatchError.isToken) {
                  message = `${dispatchError.type}.${dispatchError.asToken.type}`;
                }

                const errorMessage = `${section}.${method} ${message}`;
                console.error(`error: ${errorMessage}`);
                throw new Error(message);
              } else if (section === 'utility' && method === 'BatchInterrupted') {
                const anyData = data as any;
                const error = anyData[1].registry.findMetaError(anyData[1].asModule);
                let message = `${error.section}.${error.name}`;
                console.error(`error: ${section}.${method} ${message}`);
                resolve(false);
              }
            });
        });
      } catch (error) {
        console.error(error);
        resolve(false);
      }
    });
  }
}

export class ChainApi extends BaseApi {
  constructor(endpoint: string) {
    super(null, endpoint);
  }
  override async start() {
    await super.start();
  }

  public transferToParachain({
    toPara,
    recipientAccountId,
    amount,
    selectedToken,
  }: {
    toPara: number;
    recipientAccountId: string;
    amount: string;
    selectedToken?: Asset;
  }) {
    // public transferToParachain(toPara: number, recipientAccountId: string, amount: string) {
    // the target parachain connected to the current relaychain
    const dest = {
      V1: {
        interior: {
          X1: {
            Parachain: new BN(toPara),
          },
        },
        parents: new BN(0),
      },
    };
    // the account ID within the destination parachain
    const beneficiary = {
      V1: {
        interior: {
          X1: {
            AccountId32: {
              network: 'Any',
              id: decodeAddress(recipientAccountId),
            },
          },
        },
        parents: new BN(0),
      },
    };
    // amount of fungible tokens to be transferred
    const assets = {
      V1: [
        {
          fun: {
            Fungible: new BN(amount),
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

    return this.buildTxCall(
      'xcmPallet',
      'reserveTransferAssets',
      dest,
      beneficiary,
      assets,
      new BN(0)
    );
  }
}

export class AstarApi extends BaseApi {
  constructor(api: ApiPromise) {
    super(api);
  }

  public async fetchAssetConfig(assetId: string): Promise<{
    parents: number;
    interior: Interior;
  }> {
    const config = await this.apiInst.query.xcAssetConfig.assetIdToLocation<Option<AssetConfig>>(
      assetId
    );
    const formattedAssetConfig = JSON.parse(config.toString());
    return formattedAssetConfig.v1;
  }

  public async transferToOriginChain({
    assetId,
    recipientAccountId,
    amount,
    isNativeToken,
    paraId,
  }: {
    assetId: string;
    recipientAccountId: string;
    amount: string;
    isNativeToken: boolean;
    paraId: number;
  }): Promise<ExtrinsicPayload> {
    const isWithdrawAssets = assetId !== idAstarNativeToken;
    const functionName = isWithdrawAssets ? 'reserveWithdrawAssets' : 'reserveTransferAssets';
    const isSendToParachain = paraId > 0;
    const dest = isSendToParachain
      ? {
          V1: {
            interior: {
              X1: {
                Parachain: new BN(paraId),
              },
            },
            parents: new BN(1),
          },
        }
      : {
          V1: {
            interior: 'Here',
            parents: new BN(1),
          },
        };

    const Moonbeams = [parachainIds.MOONBEAM, parachainIds.MOONRIVER];
    const isAccountId20 = Moonbeams.includes(paraId);
    const X1 = isAccountId20
      ? {
          AccountKey20: {
            network: 'Any',
            key: recipientAccountId,
          },
        }
      : {
          AccountId32: {
            network: 'Any',
            id: decodeAddress(recipientAccountId),
          },
        };

    const beneficiary = {
      V1: {
        interior: {
          X1,
        },
        parents: new BN(0),
      },
    };

    const isRegisteredAsset = isSendToParachain && isWithdrawAssets;

    const asset = isRegisteredAsset
      ? {
          Concrete: await this.fetchAssetConfig(assetId),
        }
      : {
          Concrete: {
            interior: 'Here',
            parents: new BN(isSendToParachain ? 0 : 1),
          },
        };

    const assets = {
      V1: [
        {
          fun: {
            Fungible: new BN(amount),
          },
          id: asset,
        },
      ],
    };

    return this.buildTxCall('polkadotXcm', functionName, dest, beneficiary, assets, new BN(0));
  }
}
