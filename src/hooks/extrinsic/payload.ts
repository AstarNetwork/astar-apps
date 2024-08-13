import type { SubmittableExtrinsic } from '@polkadot/api/types';
import { u16, u32, TypeRegistry } from '@polkadot/types';
import { keccakFromArray } from 'ethereumjs-util';

export const getPayload = (
  method: SubmittableExtrinsic<'promise'>,
  nonce: u32,
  networkPrefix: number
): Uint8Array | null => {
  const methodPayload: Uint8Array = method.toU8a(true).slice(1);
  const prefix = new u16(new TypeRegistry(), networkPrefix);
  let payload = new Uint8Array(0);

  if (nonce) {
    const payloadLength = prefix.byteLength() + nonce.byteLength() + methodPayload.byteLength;
    payload = new Uint8Array(payloadLength);
    payload.set(prefix.toU8a(), 0);
    payload.set(nonce.toU8a(), prefix.byteLength());
    payload.set(methodPayload, prefix.byteLength() + nonce.byteLength());
    const buffer = keccakFromArray(Array.from(payload));

    return new Uint8Array(buffer);
  } else {
    return null;
  }
};
