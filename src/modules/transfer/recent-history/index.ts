import { castChainName } from './../../xcm/utils/index';
import { getAccountHistories, LOCAL_STORAGE } from 'src/config/localStorage';
import { RecentHistory } from './../index';
import { TxHistory } from './../../account';
import { xcmChainObj } from 'src/modules/xcm';

export const castXcmHistory = (tx: TxHistory): RecentHistory => {
  const timestamp = String(tx.timestamp);
  const txType = 'XCM';
  const from = tx.data.from as keyof typeof xcmChainObj;
  const amount = tx.data.amount as string;
  const symbol = tx.data.symbol as string;
  const note = `${castChainName(from)} to ${castChainName(tx.data.to)}`;
  const subscan = xcmChainObj[from].subscan;
  const explorerUrl = `${subscan}/extrinsic/${tx.hash}`;
  return { timestamp, txType, amount, symbol, note, explorerUrl };
};

export const getTxHistories = async ({
  address,
  network,
}: {
  address: string;
  network: string;
}): Promise<RecentHistory[]> => {
  const txs: TxHistory[] = [];
  const pushToTxs = (storageKey: LOCAL_STORAGE) => {
    const transactions = getAccountHistories({
      storageKey,
      address,
      network,
    });
    transactions.forEach((it) => txs.push(it));
  };
  pushToTxs(LOCAL_STORAGE.XCM_TX_HISTORIES);
  const numberOfHistories = 5;
  const formattedTxs = txs.sort((a, b) => b.timestamp - a.timestamp).slice(0, numberOfHistories);
  return formattedTxs
    .map((it) => {
      if (it.type === 'XCM') {
        return castXcmHistory(it);
      }
    })
    .filter((it) => it !== undefined) as RecentHistory[];
};
