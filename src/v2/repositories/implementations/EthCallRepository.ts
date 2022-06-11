import { ISubmittableResult } from '@polkadot/types/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import { BN, u8aToHex } from '@polkadot/util';
import { TypeRegistry, u32, u16 } from '@polkadot/types';
import { keccakFromArray } from 'ethereumjs-util';
import { injectable, inject } from 'inversify-props';
import { IApi } from 'src/v2/integration';
import { IEthCallRepository } from 'src/v2/repositories';
import { Guard } from 'src/v2/common';

@injectable()
export class EthCallRepository implements IEthCallRepository {
  constructor(@inject() private api: IApi) {}

  public async getCall(
    extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>,
    senderAddress: string,
    signature: string,
    nonce: BN
  ): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> {
    Guard.ThrowIfUndefined('extrinsic', extrinsic);
    Guard.ThrowIfUndefined('senderAddress', senderAddress);
    Guard.ThrowIfUndefined('signature', signature);

    const api = await this.api.getApi();

    return api.tx.ethCall.call(
      extrinsic,
      senderAddress,
      signature,
      new u32(new TypeRegistry(), nonce)
    );
  }

  /**
   * Gets payload to sign for ETH call.
   */
  public async getPayload(method: SubmittableExtrinsic<'promise'>, nonce: BN): Promise<string> {
    const api = await this.api.getApi();
    const methodPayload: Uint8Array = method.toU8a(true).slice(1);
    const magicNumber = <u16>api.consts.ethCall.callMagicNumber;
    let payload = new Uint8Array(0);

    const payloadLength = magicNumber.byteLength() + nonce.byteLength() + methodPayload.byteLength;
    payload = new Uint8Array(payloadLength);
    payload.set(magicNumber.toU8a(), 0);
    payload.set(new u32(new TypeRegistry(), nonce).toU8a(), magicNumber.byteLength());
    payload.set(methodPayload, magicNumber.byteLength() + nonce.byteLength());
    const buffer = keccakFromArray(Array.from(payload));

    return u8aToHex(new Uint8Array(buffer));
  }
}
