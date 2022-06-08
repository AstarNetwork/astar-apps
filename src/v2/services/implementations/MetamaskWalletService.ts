import { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { u16, u32, TypeRegistry } from '@polkadot/types';
import { keccakFromArray } from 'ethereumjs-util';
import { IWalletService } from 'src/v2/services';
import { useEthProvider } from 'src/hooks/custom-signature/useEthProvider';
import { EthereumProvider } from 'src/hooks/types/CustomSignature';
import { injectable } from 'inversify-props';

@injectable()
export class MetamaskWalletService implements IWalletService {
  private provider: EthereumProvider | undefined;
  constructor() {
    const { ethProvider } = useEthProvider();
    this.provider = ethProvider.value;
  }

  public async signAndSend(
    extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>,
    senderAddress: string
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  private getPayload(
    method: SubmittableExtrinsic<'promise'>,
    nonce: u32,
    networkPrefix: number
  ): Uint8Array {
    const methodPayload: Uint8Array = method.toU8a(true).slice(1);
    const prefix = new u16(new TypeRegistry(), networkPrefix);
    let payload = new Uint8Array(0);

    const payloadLength = prefix.byteLength() + nonce.byteLength() + methodPayload.byteLength;
    payload = new Uint8Array(payloadLength);
    payload.set(prefix.toU8a(), 0);
    payload.set(nonce.toU8a(), prefix.byteLength());
    payload.set(methodPayload, prefix.byteLength() + nonce.byteLength());
    const buffer = keccakFromArray(Array.from(payload));

    return new Uint8Array(buffer);
  }
}
