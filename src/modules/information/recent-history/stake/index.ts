import { RecentStakeHistory, RecentHistory, RecentHistoryTxType } from './../../index';
export const getStakeTxHistories = async ({
  address,
  network,
  symbol,
}: {
  address: string;
  network: string;
  symbol: string;
}): Promise<RecentHistory[]> => {
  // const txs: TxHistory[] = [];
  // const pushToTxs = (storageKey: LOCAL_STORAGE) => {
  //   const transactions = getAccountHistories({
  //     storageKey,
  //     address,
  //     network,
  //   });
  //   transactions.forEach((it) => txs.push(it));
  // };

  // pushToTxs(LOCAL_STORAGE.XCM_TX_HISTORIES);
  // pushToTxs(LOCAL_STORAGE.TX_HISTORIES);
  // const numberOfHistories = 5;
  // const formattedTxs = txs.sort((a, b) => b.timestamp - a.timestamp).slice(0, numberOfHistories);
  // const parsedTxs = await Promise.all(
  //   formattedTxs.map(async (it) => {
  //     const { hash } = it;
  //     try {
  //       if (it.type === HistoryTxType.Xcm) {
  //         return castXcmHistory(it);
  //       } else if (it.type === HistoryTxType.Transfer) {
  //         const tx = await fetchTransferDetails({ hash, network });
  //         return castTransferHistory({ tx, hash, network });
  //       }
  //     } catch (error) {
  //       console.error(error);
  //       return undefined;
  //     }
  //   })
  // );
  // return parsedTxs.filter((it) => it !== undefined) as RecentHistory[];

  const test: RecentHistory[] = [
    {
      amount: '100',
      explorerUrl:
        'https://astar.subscan.io/extrinsic/0x357efef5118710249970a1937ac24639f4daef75c85fe861e031eb2080739f8b',
      timestamp: '1669198080',
      symbol,
      note: '',
      txType: 'Stake',
    },
  ];

  return test;
};
