import { endpointKey } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { buildWeb3Instance, getTransactionTimestamp, setupNetwork } from 'src/config/web3';
import { useAccount } from 'src/hooks';
import {
  BridgeHistory,
  EthBridgeChainId,
  EthBridgeNetworkName,
  ZkChainId,
  checkIsL1,
  fetchAccountHistory,
  fetchIsGelatoApiHealth,
  getChainIdFromNetId,
} from 'src/modules/zk-evm-bridge';
import { container } from 'src/v2/common';
import { IZkBridgeService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { computed, onUnmounted, ref, watch } from 'vue';
import { useEthProvider } from '../custom-signature/useEthProvider';
import { astarNativeTokenErcAddr } from 'src/modules/xcm';
import { AbiItem } from 'web3-utils';
import ERC20_ABI from 'src/config/abi/ERC20.json';
import { useStore } from 'src/store';
import { useI18n } from 'vue-i18n';

export const useL1History = () => {
  const { t } = useI18n();
  const store = useStore();
  const isGelatoApiConnected = ref<boolean>(false);

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

  const handleNetwork = async (chainId: ZkChainId): Promise<void> => {
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
    if (!currentAccount.value) return;
    try {
      isLoadingHistories.value = true;
      const data = await fetchAccountHistory(currentAccount.value);
      const isHealth = await fetchIsGelatoApiHealth();
      if (!isHealth) {
        throw Error('The API is currently in maintenance mode.');
      }
      isGelatoApiConnected.value = true;

      const l1Web3 = buildWeb3Instance(EthBridgeChainId[l1Network.value as EthBridgeNetworkName]);
      const l2Web3 = buildWeb3Instance(EthBridgeChainId[l2Network.value as EthBridgeNetworkName]);
      let numberInProgress = 0;
      const formattedResult = await Promise.all(
        data.map(async (it) => {
          try {
            const isTokenOriginL1 = checkIsL1(it['orig_net']);
            const isL1Tx = checkIsL1(it['network_id']);
            const web3 = isL1Tx ? l1Web3 : l2Web3;
            const originNetWeb3 = isTokenOriginL1 ? l1Web3 : l2Web3;
            if (!web3 || !originNetWeb3) return it;
            if (it.claim_tx_hash === '') {
              numberInProgress++;
            }
            const timestamp = await getTransactionTimestamp({
              web3,
              transactionHash: it['tx_hash'],
            });
            const isActionRequired =
              it.claim_tx_hash === '' && !checkIsL1(it.network_id) && it.ready_for_claim;

            let name = 'Ether';
            let symbol = 'ETH';
            let decimal = 18;

            if (it.orig_addr !== astarNativeTokenErcAddr) {
              const contract = new originNetWeb3.eth.Contract(ERC20_ABI as AbiItem[], it.orig_addr);
              const data = await Promise.all([
                contract.methods.name().call(),
                contract.methods.symbol().call(),
                contract.methods.decimals().call(),
              ]);
              name = data[0];
              symbol = data[1];
              decimal = data[2];
            }

            return { ...it, timestamp, isActionRequired, name, symbol, decimal };
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
      // Memo: disable sending bridge transactions from UI
      store.dispatch(
        'general/showAlertMsg',
        {
          msg: t('bridge.gelatoApiError'),
          alertType: 'error',
        },
        { root: true }
      );
      isGelatoApiConnected.value = false;
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
    isGelatoApiConnected,
    handleClaim,
    fetchUserHistory,
  };
};
