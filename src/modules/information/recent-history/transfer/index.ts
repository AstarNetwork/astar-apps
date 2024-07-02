import {
  TransferDetail,
  XvmAssetsTransferHistory,
  fetchTransferDetails,
  fetchXvmAssetsTransferHistories,
  getShortenAddress,
} from '@astar-network/astar-sdk-core';
import { ethers } from 'ethers';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE, getAccountHistories } from 'src/config/localStorage';
import { EVM, getTokenDetails } from 'src/config/web3';
import { HistoryTxType, TxHistory } from 'src/modules/account';
import { LayerZeroStatus, RecentHistory, RecentLzHistory } from 'src/modules/information';
import { xcmChainObj } from 'src/modules/xcm';
import { castChainName } from 'src/modules/xcm/utils';
import { getXvmTransferContractAddress } from 'src/modules/xvm-transfer';
import { createClient } from '@layerzerolabs/scan-client';
import { urlLayerZeroScan } from 'src/modules/zk-evm-bridge';

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

export const castLzHistory = async (tx: TxHistory): Promise<RecentLzHistory> => {
  const timestamp = String(tx.timestamp);
  const amount = tx.data.amount as string;
  const symbol = tx.data.symbol as string;
  const fromChainId = tx.data.fromChainId as number;
  const fromChain = fromChainId === EVM.ASTAR_MAINNET ? 'Astar EVM' : 'Astar zkEVM';
  const toChain = fromChainId === EVM.ASTAR_MAINNET ? 'Astar zkEVM' : 'Astar EVM';
  const fromChainIndexId =
    fromChainId === EVM.ASTAR_MAINNET ? endpointKey.ASTAR : endpointKey.ASTAR_ZKEVM;
  const note = `${fromChain} to ${toChain}`;

  let explorerUrl = providerEndpoints[fromChainIndexId].blockscout + `/tx/${tx.hash}`;
  let status = 'SENT';

  try {
    const client = createClient('mainnet');
    const { messages } = await client.getMessagesBySrcTxHash(tx.hash);
    if (messages.length > 0) {
      status = messages[0].status as LayerZeroStatus;
      explorerUrl = urlLayerZeroScan + `/tx/${tx.hash}`;
    }
  } catch (error) {}

  return { timestamp, amount, symbol, note, explorerUrl, status };
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
  const networkIdx = Number(localStorage.getItem(NETWORK_IDX));
  let explorerUrl: string = '';

  if (networkIdx === endpointKey.ASTAR_ZKEVM || networkIdx === endpointKey.ZKYOTO) {
    const blockscount = providerEndpoints[networkIdx].blockscout;
    explorerUrl = `${blockscount}/tx/${hash}`;
  } else {
    const subscan = providerEndpoints[networkIdx].subscan;
    explorerUrl = `${subscan}/extrinsic/${hash}`;
  }
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

export const getLzTxHistories = async ({
  address,
  network,
}: {
  address: string;
  network: string;
}): Promise<RecentLzHistory[]> => {
  const txs: TxHistory[] = [];

  const transactions = getAccountHistories({
    storageKey: TX_HISTORIES,
    address,
    network,
  });
  transactions.forEach((it) => txs.push(it));

  const formattedTxs = txs.sort((a, b) => b.timestamp - a.timestamp).slice(0, NumberOfHistories);
  const parsedTxs = await Promise.all(
    formattedTxs.map(async (it) => {
      try {
        return await castLzHistory(it);
      } catch (error) {
        console.error(error);
        return undefined;
      }
    })
  );
  return parsedTxs.filter((it) => it !== undefined) as RecentLzHistory[];
};
