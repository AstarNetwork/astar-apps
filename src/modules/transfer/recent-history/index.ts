import { capitalize } from 'src/hooks/helper/common';
import { TransferDetail } from 'src/modules/token-api/index';
import { HistoryTxType } from 'src/modules/account';
import { castChainName } from 'src/modules/xcm/utils/index';
import { getAccountHistories, LOCAL_STORAGE } from 'src/config/localStorage';
import { RecentHistory } from 'src/modules/transfer/index';
import { TxHistory } from 'src/modules/account';
import { xcmChainObj } from 'src/modules/xcm';
import { fetchTransferDetails } from 'src/modules/token-api';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';

export const castXcmHistory = (tx: TxHistory): RecentHistory => {
  const timestamp = String(tx.timestamp);
  const txType = HistoryTxType.Xcm;
  const from = tx.data.from as keyof typeof xcmChainObj;
  const amount = tx.data.amount as string;
  const symbol = tx.data.symbol as string;
  const note = `${castChainName(from)} to ${castChainName(tx.data.to)}`;
  const subscan = xcmChainObj[from].subscan;
  const explorerUrl = `${subscan}/extrinsic/${tx.hash}`;
  return { timestamp, txType, amount, symbol, note, explorerUrl };
};

export const castTransferHistory = ({
  tx,
  hash,
  network,
}: {
  tx: TransferDetail;
  hash: string;
  network: string;
}): RecentHistory => {
  const { amount, symbol, to } = tx;
  const timestamp = String(tx.timestamp);
  const txType = HistoryTxType.Transfer;
  const chain = capitalize(network) as keyof typeof xcmChainObj;
  const note = `To ${getShortenAddress(to)}`;
  const subscan = xcmChainObj[chain].subscan;
  const explorerUrl = `${subscan}/extrinsic/${hash}`;
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
  pushToTxs(LOCAL_STORAGE.TX_HISTORIES);
  const numberOfHistories = 5;
  const formattedTxs = txs.sort((a, b) => b.timestamp - a.timestamp).slice(0, numberOfHistories);
  const parsedTxs = await Promise.all(
    formattedTxs.map(async (it) => {
      const { hash } = it;
      try {
        if (it.type === HistoryTxType.Xcm) {
          return castXcmHistory(it);
        } else if (it.type === HistoryTxType.Transfer) {
          const tx = await fetchTransferDetails({ hash, network });
          return castTransferHistory({ tx, hash, network });
        }
      } catch (error) {
        console.error(error);
        return undefined;
      }
    })
  );
  return parsedTxs.filter((it) => it !== undefined) as RecentHistory[];
};
