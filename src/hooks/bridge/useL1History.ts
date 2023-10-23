import { endpointKey } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { EVM, buildWeb3Instance, getTransactionTimestamp, setupNetwork } from 'src/config/web3';
import { useAccount } from 'src/hooks';
import {
  BridgeHistory,
  EthBridgeChainId,
  EthBridgeNetworkName,
  checkIsL1,
  fetchAccountHistory,
  getChainIdFromNetId,
} from 'src/modules/zk-evm-bridge';
import { container } from 'src/v2/common';
import { IZkBridgeService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { computed, onUnmounted, ref, watch } from 'vue';
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
      ? EthBridgeNetworkName.AstarZk
      : EthBridgeNetworkName.Zkatana;
  });

  const histories = ref<BridgeHistory[]>([]);
  const isLoadingHistories = ref<boolean>(false);
  const isFetchAutomatically = ref<boolean>(false);

  const isActionRequired = computed<boolean>(() => {
    if (histories.value.length === 0) {
      return false;
    }
    return histories.value.some((it) => it.isActionRequired);
  });

  const { currentAccount } = useAccount();
  const { web3Provider, ethProvider } = useEthProvider();

  const handleNetwork = async (chainId: EVM): Promise<void> => {
    if (!web3Provider.value || !ethProvider.value) return;
    const connectedNetwork = await web3Provider.value!.eth.net.getId();
    if (connectedNetwork !== chainId) {
      await setupNetwork({ network: chainId, provider: ethProvider.value });
    }
  };

  const handleClaim = async (withdrawal: BridgeHistory): Promise<String> => {
    const toChainId = getChainIdFromNetId(withdrawal.dest_net);
    await handleNetwork(toChainId);
    const zkBridgeService = container.get<IZkBridgeService>(Symbols.ZkBridgeService);
    return await zkBridgeService.claimAsset({
      withdrawal,
      senderAddress: currentAccount.value,
    });
  };

  const fetchUserHistory = async (): Promise<void> => {
    try {
      isLoadingHistories.value = true;
      const data = await fetchAccountHistory(currentAccount.value);
      const l1Web3 = buildWeb3Instance(EthBridgeChainId[l1Network.value as EthBridgeNetworkName]);
      const l2Web3 = buildWeb3Instance(EthBridgeChainId[l2Network.value as EthBridgeNetworkName]);

      let numberInProgress = 0;
      const formattedResult = await Promise.all(
        data.map(async (it) => {
          try {
            const isL1 = checkIsL1(it['network_id']);
            const web3 = isL1 ? l1Web3 : l2Web3;
            if (!web3) return it;
            if (it.claim_tx_hash === '') {
              numberInProgress++;
            }
            const timestamp = await getTransactionTimestamp({
              web3,
              transactionHash: it['tx_hash'],
            });
            const isActionRequired =
              it.claim_tx_hash === '' && !checkIsL1(it.network_id) && it.ready_for_claim;
            return { ...it, timestamp, isActionRequired };
          } catch (error) {
            console.info('something went wrong: ', it);
            console.error(error);
            return { ...it, timestamp: 0, isActionRequired: false };
          }
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

  return {
    l1Network,
    l2Network,
    histories,
    isLoadingHistories,
    isActionRequired,
    handleClaim,
    fetchUserHistory,
  };
};
