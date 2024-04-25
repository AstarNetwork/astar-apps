import { AbiItem } from 'web3-utils';
import axios from 'axios';
import { endpointKey } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import {
  BridgeHistory,
  EthBridgeChainId,
  EthBridgeChainIdToName,
  EthBridgeContract,
  EthBridgeNetworkName,
  ZK_EVM_AGGREGATED_BRIDGE_ABI,
  ZkChainId,
  ZkNetworkId,
  zkEvmApi,
  DEFAULT_TOKENS,
} from 'src/modules/zk-evm-bridge';

import { buildWeb3Instance } from 'src/config/web3';
import Web3 from 'web3';
import { astarNativeTokenErcAddr } from 'src/modules/xcm';

type MerkleProof = {
  main_exit_root: string;
  merkle_proof: string[];
  // Todo: remove '?'
  rollup_merkle_proof?: string[];
  rollup_exit_root: string;
};

export const getNetworkId = async (chainName: EthBridgeNetworkName): Promise<number> => {
  const chainId = EthBridgeChainId[chainName];
  const web3 = buildWeb3Instance(chainId);
  if (!web3) throw Error('Failed creating Web3 instance');

  const contractAddress = EthBridgeContract[chainName];

  const abi = ZK_EVM_AGGREGATED_BRIDGE_ABI;
  const contract = new web3.eth.Contract(abi as AbiItem[], contractAddress);
  return Number(await contract.methods.networkID().call());
};

export const checkIsL1 = (zkNetwork: ZkNetworkId): boolean => {
  return zkNetwork === ZkNetworkId.L1;
};

export const getMainOrTestNet = (): 'mainnet' | 'testnet' => {
  const networkIdxStore = String(localStorage.getItem(LOCAL_STORAGE.NETWORK_IDX));
  return networkIdxStore === String(endpointKey.ASTAR_ZKEVM) ? 'mainnet' : 'testnet';
};

export const getChainIdFromNetId = (zkNetwork: ZkNetworkId): ZkChainId => {
  const network = getMainOrTestNet();
  if (network === 'mainnet') {
    return zkNetwork === ZkNetworkId.L1
      ? EthBridgeChainId[EthBridgeNetworkName.Ethereum]
      : EthBridgeChainId[EthBridgeNetworkName.AstarZk];
  } else {
    return zkNetwork === ZkNetworkId.L1
      ? EthBridgeChainId[EthBridgeNetworkName.Sepolia]
      : EthBridgeChainId[EthBridgeNetworkName.Zkyoto];
  }
};

const getApiUrl = (): string => {
  const network = getMainOrTestNet();
  return zkEvmApi[network];
};

export const fetchIsGelatoApiHealth = async (): Promise<boolean> => {
  const base = getApiUrl();
  const url = `${base}/healthz`;
  const result = await axios.get<{ status: string }>(url);
  return result && result.data.status === 'SERVING';
};

export const fetchAccountHistory = async (address: string): Promise<BridgeHistory[]> => {
  const base = getApiUrl();
  const limit = 15;
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

export const getBridgedTokenAddress = async ({
  srcChainId,
  tokenAddress,
  name,
  symbol,
  decimal,
}: {
  srcChainId: ZkChainId;
  tokenAddress: string;
  name: string;
  symbol: string;
  decimal: number;
}): Promise<string> => {
  const fromChainName = EthBridgeChainIdToName[srcChainId];
  const fromChainWeb3 = buildWeb3Instance(srcChainId) as Web3;
  const toChainContractAddress = EthBridgeContract[fromChainName];

  const abi = ZK_EVM_AGGREGATED_BRIDGE_ABI;
  const fromChainContract = new fromChainWeb3.eth.Contract(
    abi as AbiItem[],
    toChainContractAddress
  );

  const networkId = await getNetworkId(fromChainName);

  // Memo: check if the bridge token is wrapped token
  const data = await fromChainContract.methods.wrappedTokenToTokenInfo(tokenAddress).call();
  const originTokenAddress = data[1];
  const isOriginalToken = originTokenAddress === astarNativeTokenErcAddr;

  // Memo: Bridge the original ERC20 token (deposit)
  if (isOriginalToken) {
    return await fromChainContract.methods
      .precalculatedWrapperAddress(networkId, tokenAddress, name, symbol, decimal)
      .call();
  } else {
    // Memo: bridge back the wrapped token (withdrawal)
    return originTokenAddress;
  }
};

export const getShortNetworkName = (network: string) => {
  return network.replace('Testnet', '');
};

// Memo: add default tokens to Astar zkEVM assets
export const handleAddDefaultTokens = (): void => {
  try {
    const importedEvmTokens = localStorage.getItem(LOCAL_STORAGE.EVM_TOKEN_IMPORTS);
    const tokensData = importedEvmTokens ? JSON.parse(importedEvmTokens) : [];
    const mergedArray = [...DEFAULT_TOKENS, ...tokensData];
    const seen = new Set();
    const updatedTokens = mergedArray.filter((token: any) => {
      const duplicate = seen.has(`${token.srcChainId}-${token.address}`);
      seen.add(`${token.srcChainId}-${token.address}`);
      return !duplicate;
    });

    // Todo: this is temporary solution to remove weETH from browser's localstorage
    // This will be removed after OFT weETH is added to Astar zkEVM assets
    const filteredTokens = updatedTokens.filter((token) => {
      const weEthEthereum = '0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee';
      const weEthZkevm = '0xcD68DFf4415358c35a28f96Fd5bF7083B22De1D6';
      const address = token.address.toLowerCase();
      return address !== weEthEthereum.toLowerCase() && address !== weEthZkevm.toLowerCase();
    });

    localStorage.setItem(LOCAL_STORAGE.EVM_TOKEN_IMPORTS, JSON.stringify(filteredTokens));
  } catch (error) {
    console.error(error);
  }
};
