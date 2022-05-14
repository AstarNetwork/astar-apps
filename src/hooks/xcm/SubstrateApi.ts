import { ApiPromise, WsProvider } from '@polkadot/api';
import { ISubmittableResult } from '@polkadot/types/types';
import { SignerOptions } from '@polkadot/api/types';
import { ITuple } from '@polkadot/types/types';
import { Vec, u32, TypeRegistry } from '@polkadot/types';
import {
  DispatchError,
  VersionedXcm,
  MultiLocation,
  AssetMetadata,
  AssetDetails,
  MultiAsset,
} from '@polkadot/types/interfaces';
import BN from 'bn.js';
import { ExtrinsicPayload } from 'src/hooks/helper';
import { decodeAddress } from '@polkadot/util-crypto';
import Web3 from 'web3';

const AUTO_CONNECT_MS = 10_000; // [ms]

interface ChainProperty {
  tokenSymbols: string[];
  tokenDecimals: number[];
  chainName: string;
  ss58Prefix: number;
}

class ChainApi {
  private _provider: WsProvider;
  private _api: ApiPromise;
  private _chainProperty: ChainProperty | undefined;
  private _registry: TypeRegistry;

  constructor(endpoint: string) {
    this._provider = new WsProvider(endpoint, AUTO_CONNECT_MS);

    console.log('connecting to ' + endpoint);
    this._api = new ApiPromise({
      provider: this._provider,
    });

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

  public async getBlockHash(blockNumber: number) {
    return await this._api?.rpc.chain.getBlockHash(blockNumber);
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

  public async getBalance(address: string) {
    return ((await this._api?.query.system.account(address)) as any).data.free.toBn() as BN;
  }

  public async signAndSend(
    account: string,
    signer: any,
    tx: ExtrinsicPayload,
    handleResult?: (result: ISubmittableResult) => Promise<boolean>
  ) {
    const txsToExecute: ExtrinsicPayload[] = [];
    txsToExecute.push(tx);
    const transaction = this._api.tx.utility.batch(txsToExecute);
    // ensure that we automatically increment the nonce per transaction
    return await transaction.signAndSend(account, { signer, nonce: -1, tip: 1 }, (result) => {
      console.log('r', result);
      handleResult && handleResult(result);
      // handle transaction errors
      result.events
        .filter((record): boolean => !!record.event && record.event.section !== 'democracy')
        .map(({ event: { data, method, section } }) => {
          if (section === 'system' && method === 'ExtrinsicFailed') {
            const [dispatchError] = data as unknown as ITuple<[DispatchError]>;
            let message = dispatchError.type.toString();

            if (dispatchError.isModule) {
              try {
                const mod = dispatchError.asModule;
                const error = dispatchError.registry.findMetaError(mod);

                message = `${error.section}.${error.name}`;
              } catch (error) {
                console.error(error);
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
          }
        });
    });
  }
}

export class RelaychainApi extends ChainApi {
  constructor(endpoint: string) {
    super(endpoint);
  }
  override async start() {
    await super.start();

    // const parachains = (await this.buildStorageQuery('paras', 'parachains')) as Vec<u32>;
    // this._parachains = parachains.map((i) => i.toNumber());
    // check if the connected network implements xcmPallet
  }

  public transferToParachain(toPara: number, recipientAccountId: string, amount: BN) {
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

    return this.buildTxCall(
      'xcmPallet',
      'reserveTransferAssets',
      dest,
      beneficiary,
      assets,
      new BN(0)
    );
  }

  public xcmReserveTransferAsset(
    dest: MultiLocation,
    beneficiary: MultiLocation,
    assets: MultiAsset,
    feeAssetItem: BN
  ) {
    return this.buildTxCall(
      'xcmPallet',
      'reserveTransferAssets',
      dest,
      beneficiary,
      assets,
      feeAssetItem
    );
  }

  public xcmExecute(message: VersionedXcm, maxWeight: BN) {
    return this.buildTxCall('xcmPallet', 'execute', message, maxWeight);
  }

  public xcmSend(dest: MultiLocation, message: VersionedXcm) {
    return this.buildTxCall('xcmPallet', 'send', dest, message);
  }
}
