import axios from 'axios';
import { ethers } from 'ethers';
import { TOKEN_API_URL } from 'src/modules/token-api';
import { DappCombinedInfo } from 'src/v2/models';
import { RecentHistory, RecentHistoryTxType } from './../../index';

interface UserStakeHistory {
  timestamp: string;
  contractAddress: string;
  transaction: string;
  amount: string;
  transactionHash?: string;
  transactionSuccess?: boolean;
}

export const getStakeTxHistories = async ({
  address,
  network,
  symbol,
  dapps,
}: {
  address: string;
  network: string;
  symbol: string;
  dapps: DappCombinedInfo[];
}): Promise<RecentHistory[]> => {
  const url = `${TOKEN_API_URL}/v1/${network}/dapps-staking/stats/user/${address}`;
  const result = await axios.get<UserStakeHistory[]>(url);
  const numberOfHistories = 5;
  return result.data
    .filter((it) => it.transaction === 'BondAndStake' || it.transaction === 'NominationTransfer')
    .map((it) => {
      const dapp = dapps.find(
        (that) => that.contract.address.toLowerCase() === it.contractAddress.toLowerCase()
      );
      // Todo: update the explorerURL
      return {
        amount: ethers.utils.formatEther(it.amount),
        explorerUrl:
          'https://astar.subscan.io/extrinsic/0x357efef5118710249970a1937ac24639f4daef75c85fe861e031eb2080739f8b',
        timestamp: String(Number(it.timestamp) / 1000),
        symbol,
        note: dapp?.dapp?.name || '',
        txType: it.transaction as RecentHistoryTxType,
      };
    })
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    .slice(0, numberOfHistories);
};
