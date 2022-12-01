import axios from 'axios';
import { ethers } from 'ethers';
import { TOKEN_API_URL } from 'src/modules/token-api';
import { DappCombinedInfo } from 'src/v2/models';
import { RecentHistory, RecentHistoryTxType } from './../../index';

interface UserStakeHistory {
  timestamp: string;
  contractAddress: string;
  transaction: RecentHistoryTxType;
  amount: string;
  transactionHash?: string;
  transactionSuccess?: boolean;
}

export const castStakeTxType = (txType: RecentHistoryTxType): string => {
  switch (txType) {
    case 'BondAndStake':
      return 'Stake';
    case 'NominationTransfer':
      return 'Nomination Transfer';
    case 'UnbondAndUnstake':
      return 'Unstake';
    default:
      return txType;
  }
};

export const getStakeTxHistories = async ({
  address,
  network,
  symbol,
  dapps,
  subScan,
}: {
  address: string;
  network: string;
  symbol: string;
  dapps: DappCombinedInfo[];
  subScan: string;
}): Promise<RecentHistory[]> => {
  const url = `${TOKEN_API_URL}/v1/${network}/dapps-staking/stats/user/${address}/1%20years`;
  const result = await axios.get<UserStakeHistory[]>(url);
  const numberOfHistories = 5;
  return result.data
    .filter(
      (it) =>
        it.transaction === 'BondAndStake' ||
        it.transaction === 'NominationTransfer' ||
        it.transaction === 'UnbondAndUnstake'
    )
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    .slice(0, numberOfHistories)
    .map((it) => {
      const dapp = dapps.find(
        (that) => that.contract.address.toLowerCase() === it.contractAddress.toLowerCase()
      );
      const note = dapp && dapp.dapp ? dapp.dapp.name : '';
      const explorerUrl = subScan + '/extrinsic/' + it.transactionHash;
      return {
        amount: ethers.utils.formatEther(it.amount),
        timestamp: String(Number(it.timestamp) / 1000),
        txType: it.transaction as RecentHistoryTxType,
        explorerUrl,
        symbol,
        note,
      };
    });
};
