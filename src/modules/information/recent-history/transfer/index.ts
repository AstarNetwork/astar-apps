import { TransferDetail } from 'src/modules/token-api';
import { HistoryTxType } from 'src/modules/account';
import { castChainName } from 'src/modules/xcm/utils';
import { getAccountHistories, LOCAL_STORAGE } from 'src/config/localStorage';
import { RecentHistory } from 'src/modules/information';
import { TxHistory } from 'src/modules/account';
import { xcmChainObj } from 'src/modules/xcm';
import { fetchTransferDetails } from 'src/modules/token-api';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import { getNetworkName, providerEndpoints } from 'src/config/chainEndpoints';

const { NETWORK_IDX, XVM_TX_HISTORIES, XCM_TX_HISTORIES, TX_HISTORIES } = LOCAL_STORAGE;

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

export const castXvmHistory = ({
  tx,
  hash,
  timestamp,
}: {
  tx: TransferDetail;
  hash: string;
  timestamp: number;
}): RecentHistory => {
  const { amount, symbol, to } = tx;
  const txType = HistoryTxType.Xvm;
  const note = `To ${getShortenAddress(to)}`;
  const networkIdx = localStorage.getItem(NETWORK_IDX);
  const subscan = providerEndpoints[Number(networkIdx)].subscan;
  const explorerUrl = `${subscan}/extrinsic/${hash}`;
  return { timestamp: String(timestamp), txType, amount, symbol, note, explorerUrl };
};

export const castTransferHistory = ({
  tx,
  hash,
}: {
  tx: TransferDetail;
  hash: string;
}): RecentHistory => {
  const { amount, symbol, to } = tx;
  const timestamp = String(tx.timestamp);
  const txType = HistoryTxType.Transfer;
  const note = `To ${getShortenAddress(to)}`;
  const networkIdx = localStorage.getItem(NETWORK_IDX);
  const subscan = providerEndpoints[Number(networkIdx)].subscan;
  const explorerUrl = `${subscan}/extrinsic/${hash}`;
  return { timestamp, txType, amount, symbol, note, explorerUrl };
};

export const getTxHistories = async ({
  address,
}: {
  address: string;
}): Promise<RecentHistory[]> => {
  const networkIdx = localStorage.getItem(NETWORK_IDX);
  const network = getNetworkName(Number(networkIdx));
  const txs: TxHistory[] = [];
  const histories = [XVM_TX_HISTORIES, XCM_TX_HISTORIES, TX_HISTORIES];

  histories.forEach((storageKey) => {
    const transactions = getAccountHistories({
      storageKey,
      address,
      network,
    });
    transactions.forEach((it) => txs.push(it));
  });

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
          return castTransferHistory({ tx, hash });
        } else if (it.type === HistoryTxType.Xvm) {
          return castXvmHistory({ tx: it.data, hash, timestamp: it.timestamp });
        }
      } catch (error) {
        console.error(error);
        return undefined;
      }
    })
  );
  return parsedTxs.filter((it) => it !== undefined) as RecentHistory[];
};
