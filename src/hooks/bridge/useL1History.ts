import { ethers } from 'ethers';
import { endpointKey } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { getNativeBalance, setupNetwork } from 'src/config/web3';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { astarNativeTokenErcAddr } from 'src/modules/xcm';
import {
  EthBridgeChainId,
  EthBridgeNetworkName,
  ZK_EVM_BRIDGE_ABI,
} from 'src/modules/zk-evm-bridge';
import { useStore } from 'src/store';
import { computed, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { AbiItem } from 'web3-utils';
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

  watch([], () => {}, { immediate: true });

  watchEffect(async () => {});

  return {};
};
