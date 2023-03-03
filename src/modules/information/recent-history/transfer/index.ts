import { getXvmTransferContractAddress } from 'src/modules/xvm-transfer';
import { HistoryTxType } from 'src/modules/account';
import { castChainName } from 'src/modules/xcm/utils';
import { getAccountHistories, LOCAL_STORAGE } from 'src/config/localStorage';
import { RecentHistory } from 'src/modules/information';
import { TxHistory } from 'src/modules/account';
import { xcmChainObj } from 'src/modules/xcm';
import { providerEndpoints } from 'src/config/chainEndpoints';
import {
  fetchXvmAssetsTransferHistories,
  fetchTransferDetails,
  TransferDetail,
  XvmAssetsTransferHistory,
  getShortenAddress,
} from '@astar-network/astar-sdk-core';
import { getTokenDetails } from 'src/config/web3';
import { ethers } from 'ethers';

const { NETWORK_IDX, XVM_TX_HISTORIES, XCM_TX_HISTORIES, TX_HISTORIES } = LOCAL_STORAGE;
const NumberOfHistories = 5;

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

const castXvmHistory = async (tx: XvmAssetsTransferHistory): Promise<RecentHistory> => {
  const txType = HistoryTxType.Xvm;
  const note = `To ${getShortenAddress(tx.destination)}`;
  const networkIdx = localStorage.getItem(NETWORK_IDX);
  const subscan = providerEndpoints[Number(networkIdx)].subscan;
  const explorerUrl = `${subscan}/extrinsic/${tx.extrinsicHash}`;
  const { symbol, decimals } = await getTokenDetails({
    tokenAddress: tx.erc20Address,
    srcChainId: Number(providerEndpoints[Number(networkIdx)].evmChainId),
  });
  const amount = ethers.utils.formatUnits(tx.amount, decimals);
  return { timestamp: String(tx.timestamp), txType, amount, symbol, note, explorerUrl };
};

export const getXvmAssetsTransferHistories = async ({
  address,
  network,
}: {
  address: string;
  network: string;
}): Promise<RecentHistory[]> => {
  const contractAddress = getXvmTransferContractAddress() as string;
  const txs = await fetchXvmAssetsTransferHistories({
    senderAddress: address,
    contractAddress,
    network,
  });
  const sortedTxs = txs.sort((a, b) => b.timestamp - a.timestamp).slice(0, NumberOfHistories);
  return await Promise.all(sortedTxs.map(async (it) => await castXvmHistory(it)));
};

export const getTxHistories = async ({
  address,
  network,
}: {
  address: string;
  network: string;
}): Promise<RecentHistory[]> => {
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

  const formattedTxs = txs.sort((a, b) => b.timestamp - a.timestamp).slice(0, NumberOfHistories);

  const parsedTxs = await Promise.all(
    formattedTxs.map(async (it) => {
      const { hash } = it;
      try {
        if (it.type === HistoryTxType.Xcm) {
          return castXcmHistory(it);
        } else if (it.type === HistoryTxType.Transfer) {
          const tx = await fetchTransferDetails({ hash, network });
          return castTransferHistory({ tx, hash });
        }
      } catch (error) {
        console.error(error);
        return undefined;
      }
    })
  );
  return parsedTxs.filter((it) => it !== undefined) as RecentHistory[];
};
