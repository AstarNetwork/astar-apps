import type {
  PartialQueueTxExtrinsic,
  QueueTxExtrinsic,
  QueueTx,
  QueueTxRpc,
} from 'src/hooks/types/Status';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';

export default function usePendingTx(
  propsExtrinsic: SubmittableExtrinsic<'promise'> | null,
  accountId: string,
  _onStart: any,
  _onFailed: any,
  _onSuccess: any,
  _onUpdate: any
) {
  const SUBMIT_RPC = jsonrpc.author.submitAndWatchExtrinsic;

  let extrinsics: SubmittableExtrinsic<'promise'>[] | undefined;

  if (propsExtrinsic) {
    extrinsics = Array.isArray(propsExtrinsic) ? propsExtrinsic : [propsExtrinsic];
  }

  let txqueue: QueueTx[] = [];
  let nextId = 0;

  const addToTxQueue = (value: QueueTxExtrinsic | QueueTxRpc | QueueTx): void => {
    const id = ++nextId;
    const removeItem = () => {
      ////
    };

    txqueue = [
      {
        ...value,
        id,
        removeItem,
        rpc: (value as QueueTxRpc).rpc || SUBMIT_RPC,
        status: 'queued',
      },
    ];
  };

  const queueExtrinsic = (value: PartialQueueTxExtrinsic) => addToTxQueue({ ...value });

  extrinsics?.forEach((extrinsic): void => {
    queueExtrinsic({
      accountId: accountId && accountId.toString(),
      extrinsic,
      isUnsigned: false,
      txFailedCb: _onFailed,
      txStartCb: _onStart,
      txSuccessCb: _onSuccess,
      txUpdateCb: _onUpdate,
    });
  });

  return {
    txqueue,
  };
}
