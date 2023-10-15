import axios from 'axios';
import { endpointKey } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import {
  BridgeHistory,
  EthBridgeChainId,
  EthBridgeContract,
  EthBridgeNetworkName,
  ZkNetworkId,
  zkEvmApi,
} from 'src/modules/zk-evm-bridge';

import { EVM } from 'src/config/web3';

type MerkleProof = {
  main_exit_root: string;
  merkle_proof: string[];
  rollup_exit_root: string;
};

export const checkIsL1 = (zkNetwork: ZkNetworkId): boolean => {
  return zkNetwork === ZkNetworkId.L1;
};

const getMainOrTestNet = (): 'mainnet' | 'testnet' => {
  const networkIdxStore = String(localStorage.getItem(LOCAL_STORAGE.NETWORK_IDX));
  return networkIdxStore === String(endpointKey.ASTAR_ZKEVM) ? 'mainnet' : 'testnet';
};

export const getContractFromNetId = (zkNetwork: ZkNetworkId): string => {
  const network = getMainOrTestNet();
  if (network === 'mainnet') {
    return zkNetwork === ZkNetworkId.L1
      ? EthBridgeContract[EthBridgeNetworkName.Ethereum]
      : EthBridgeContract[EthBridgeNetworkName.AstarZk];
  } else {
    return zkNetwork === ZkNetworkId.L1
      ? EthBridgeContract[EthBridgeNetworkName.Sepolia]
      : EthBridgeContract[EthBridgeNetworkName.Akiba];
  }
};

export const getChainIdFromNetId = (zkNetwork: ZkNetworkId): EVM => {
  const network = getMainOrTestNet();
  if (network === 'mainnet') {
    return zkNetwork === ZkNetworkId.L1
      ? EthBridgeChainId[EthBridgeNetworkName.Ethereum]
      : EthBridgeChainId[EthBridgeNetworkName.AstarZk];
  } else {
    return zkNetwork === ZkNetworkId.L1
      ? EthBridgeChainId[EthBridgeNetworkName.Sepolia]
      : EthBridgeChainId[EthBridgeNetworkName.Akiba];
  }
};

const getApiUrl = (): string => {
  const network = getMainOrTestNet();
  return zkEvmApi[network];
};

export const fetchAccountHistory = async (address: string): Promise<BridgeHistory[]> => {
  const base = getApiUrl();
  // const limit = 10;
  const limit = 5;
  const url = `${base}/bridges/${address}?limit=${limit}&offset=0`;
  const result = await axios.get<{ deposits: BridgeHistory[] }>(url);
  return result.data.deposits;
};

export const fetchMerkleProof = async (
  depositCount: string,
  net_id: number
): Promise<MerkleProof> => {
  const base = getApiUrl();
  const result = await axios.request<{ proof: MerkleProof }>({
    baseURL: base,
    method: 'GET',
    params: {
      deposit_cnt: depositCount,
      net_id,
    },
    url: '/merkle-proof',
  });
  return result.data.proof;
};
