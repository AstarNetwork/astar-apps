import { u128 } from '@polkadot/types';
import {
  buildEvmAddress,
  hasProperty,
  isValidEvmAddress,
  toSS58Address,
} from '@astar-network/astar-sdk-core';
import { AccountId32, H160 } from '@polkadot/types/interfaces';
import { inject, injectable } from 'inversify';
import { Guard } from 'src/v2/common';
import { ExtrinsicPayload, IApi } from 'src/v2/integration';
import { IdentityData } from 'src/v2/models';
import { IAccountUnificationRepository, IIdentityRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import e from 'express';

@injectable()
export class AccountUnificationRepository implements IAccountUnificationRepository {
  constructor(
    @inject(Symbols.IdentityRepository) private identityRepository: IIdentityRepository,
    @inject(Symbols.DefaultApi) private readonly api: IApi
  ) {}

  public async getClaimEvmAccountCall(
    evmAddress: string,
    signature: string
  ): Promise<ExtrinsicPayload> {
    Guard.ThrowIfUndefined('h160Address', evmAddress);
    Guard.ThrowIfUndefined('signature', signature);

    const api = await this.api.getApi();

    return api.tx.unifiedAccounts.claimEvmAddress(evmAddress, signature);
  }

  public async getMappedNativeAddress(evmAddress: string): Promise<string> {
    Guard.ThrowIfUndefined('evmAddress', evmAddress);

    if (!isValidEvmAddress(evmAddress)) {
      return evmAddress;
    }

    const api = await this.api.getApi();
    const nativeAddress = hasProperty(api.query, 'unifiedAccounts')
      ? await api.query.unifiedAccounts.evmToNative<AccountId32>(evmAddress)
      : '';

    return nativeAddress.toString();
  }

  public async getMappedEvmAddress(nativeAddress: string): Promise<string> {
    Guard.ThrowIfUndefined('nativeAddress', nativeAddress);

    const api = await this.api.getApi();
    const evmAddress = hasProperty(api.query, 'unifiedAccounts')
      ? await api.query.unifiedAccounts.nativeToEvm<H160>(nativeAddress)
      : '';

    return evmAddress.toString();
  }

  public async getConvertedNativeAddress(evmAddress: string): Promise<string> {
    Guard.ThrowIfUndefined('evmAddress', evmAddress);
    const nativeAddress = await this.getMappedNativeAddress(evmAddress);
    return nativeAddress !== '' ? nativeAddress : toSS58Address(evmAddress);
  }

  public async getConvertedEvmAddress(nativeAddress: string): Promise<string> {
    Guard.ThrowIfUndefined('nativeAddress', nativeAddress);
    const evmAddress = await this.getMappedEvmAddress(nativeAddress);
    return evmAddress !== '' ? evmAddress : buildEvmAddress(nativeAddress);
  }

  public async handleCheckIsUnifiedAccount(address: string): Promise<boolean> {
    Guard.ThrowIfUndefined('address', address);

    const api = await this.api.getApi();
    const isEvmAddress = isValidEvmAddress(address);
    const isRuntimeApplied = hasProperty(api.query, 'unifiedAccounts');
    if (!isRuntimeApplied) return false;

    const mappedAddress = isEvmAddress
      ? await api.query.unifiedAccounts.evmToNative<AccountId32>(address)
      : await api.query.unifiedAccounts.nativeToEvm<H160>(address);

    return mappedAddress.toString() !== '';
  }

  public async getUnifyAccountsBatchAllCall(
    nativeAddress: string,
    evmAddress: string,
    signature: string,
    identityInfo: IdentityData
  ): Promise<ExtrinsicPayload> {
    const api = await this.api.getApi();

    const identityCall = await this.identityRepository.getSetIdentityCall(
      nativeAddress,
      identityInfo
    );
    const unifyCall = await this.getClaimEvmAccountCall(evmAddress, signature);

    return api.tx.utility.batchAll([identityCall, unifyCall]);
  }

  public async getUnificationFee(): Promise<bigint> {
    const api = await this.api.getApi();
    const fee = <u128>api.consts.unifiedAccounts.accountMappingStorageFee;

    return fee.toBigInt();
  }
}
