import axios from 'axios';
import { endpointKey } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { buildWeb3Instance } from 'src/config/web3';
import { useAccount } from 'src/hooks';
import {
  BridgeHistory,
  EthBridgeChainId,
  EthBridgeNetworkName,
  checkIsL1,
  zkEvmApi,
} from 'src/modules/zk-evm-bridge';
import { computed, ref, watch, watchEffect, onUnmounted } from 'vue';
import { useEthProvider } from '../custom-signature/useEthProvider';

export const useL1History = () => {
  const l1Network = computed<string>(() => {
    const networkIdxStore = String(localStorage.getItem(LOCAL_STORAGE.NETWORK_IDX));
    return networkIdxStore === String(endpointKey.ASTAR_ZKEVM)
      ? EthBridgeNetworkName.Ethereum
      : EthBridgeNetworkName.Sepolia;
  });

  const l2Network = computed<string>(() => {
    const networkIdxStore = String(localStorage.getItem(LOCAL_STORAGE.NETWORK_IDX));
    return networkIdxStore === String(endpointKey.ASTAR_ZKEVM)
      ? EthBridgeNetworkName.Astar
      : EthBridgeNetworkName.Akiba;
  });

  const histories = ref<BridgeHistory[]>([]);
  const isLoadingHistories = ref<boolean>(false);
  const isFetchAutomatically = ref<boolean>(false);

  const { currentAccount } = useAccount();
  const { web3Provider, ethProvider } = useEthProvider();

  const fetchUserHistory = async (): Promise<void> => {
    const address = currentAccount.value;
    const l1Chain = l1Network.value;
    const l2Chain = l2Network.value;

    try {
      isLoadingHistories.value = true;
      const networkIdxStore = String(localStorage.getItem(LOCAL_STORAGE.NETWORK_IDX));
      const network = networkIdxStore === String(endpointKey.ASTAR_ZKEVM) ? 'mainnet' : 'testnet';
      const base = zkEvmApi[network];
      const limit = 25;
      const url = `${base}/bridges/${address}?limit=${limit}&offset=0`;
      const result = await axios.get<{ deposits: BridgeHistory[] }>(url);
      const data = result.data.deposits;
      const l1Web3 = buildWeb3Instance(EthBridgeChainId[l1Chain as EthBridgeNetworkName]);
      const l2Web3 = buildWeb3Instance(EthBridgeChainId[l2Chain as EthBridgeNetworkName]);

      let numberInProgress = 0;
      const formattedResult = await Promise.all(
        data.map(async (it) => {
          const isL1 = checkIsL1(it['network_id']);
          const web3 = isL1 ? l1Web3 : l2Web3;
          if (!web3) return it;
          if (it.claim_tx_hash === '') {
            numberInProgress++;
          }
          const txHash = it['tx_hash'];
          const transaction = await web3.eth.getTransaction(txHash);
          if (!transaction || !transaction.blockNumber) {
            console.error('Transaction not found', transaction);
            return it;
          }

          const block = await web3.eth.getBlock(transaction.blockNumber);
          const timestamp = Number(block.timestamp);
          return { ...it, timestamp };
        })
      );

      isFetchAutomatically.value = numberInProgress > 0;
      histories.value = formattedResult.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
    } catch (error) {
      console.error(error);
      isFetchAutomatically.value = false;
    } finally {
      isLoadingHistories.value = false;
    }
  };

  watch([currentAccount], fetchUserHistory, { immediate: true });

  const autoFetchHistoryHandler = setInterval(async () => {
    if (isFetchAutomatically.value) {
      await fetchUserHistory();
    }
  }, 30 * 1000);

  onUnmounted(() => {
    clearInterval(autoFetchHistoryHandler);
  });

  return { l1Network, l2Network, histories, isLoadingHistories, fetchUserHistory };
};
