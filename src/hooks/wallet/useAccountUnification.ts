import { $api } from 'boot/api';
import { setupNetwork } from 'src/config/web3';
import { useAccount } from 'src/hooks/useAccount';
import { useStore } from 'src/store';
import { WatchCallback, computed, ref, watch, watchEffect } from 'vue';
import Web3 from 'web3';
import { useNetworkInfo } from '../useNetworkInfo';

import { getIndividualClaimTxs, toSS58Address } from '@astar-network/astar-sdk-core';
import { MyStakeInfo, useCurrentEra } from 'src/hooks';
import { container } from 'src/v2/common';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import { IDappStakingService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';

const provider = window.ethereum;

export const useAccountUnification = () => {
  const web3 = ref<Web3>();
  const selectedEvmAddress = ref<string>('');
  const isConnectedNetwork = ref<boolean>(false);
  const isStaking = ref<boolean>(true);

  const store = useStore();
  const { currentAccount } = useAccount();
  const { evmNetworkIdx } = useNetworkInfo();
  const { era } = useCurrentEra();

  const dapps = computed<DappCombinedInfo[]>(() => store.getters['dapps/getAllDapps']);

  const getSelectedEvmAddress = async (web3: Web3): Promise<string> => {
    const accounts = await web3.eth.getAccounts();
    return accounts[0];
  };

  const setWeb3 = async (): Promise<void> => {
    if (!provider || typeof window.ethereum === 'undefined') return;
    web3.value = new Web3(window.ethereum as any);
    selectedEvmAddress.value = await getSelectedEvmAddress(web3.value);
    const chainId = `0x${evmNetworkIdx.value.toString(16)}`;
    if (provider.chainId !== chainId) {
      await setupNetwork({ network: evmNetworkIdx.value, provider });
    }
    isConnectedNetwork.value = provider.chainId === chainId;
  };
  const updateEvmProvider: WatchCallback<[string, Web3?]> = (
    [selectedEvmAddress, web3],
    _,
    registerCleanup
  ) => {
    if (!currentAccount || !web3 || !provider || typeof window.ethereum === 'undefined') {
      return;
    }

    const handleAccountsChanged = async (accounts: string[]): Promise<void> => {
      const account = await getSelectedEvmAddress(web3);
      if (account !== selectedEvmAddress) {
        await setWeb3();
      }
    };

    const handleChainChanged = () => {
      // Memo: refresh the page if the user changes the network
      window.location.reload();
    };

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);
    registerCleanup(() => {
      // Memo: this block calls a lot of `watchs` / `watchEffects` (that outside of this file) way too much after hot reloading
      if (!process.env.DEV) {
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', handleChainChanged);
      }
    });
  };

  const checkStakerInfo = async () => {
    if (!selectedEvmAddress.value || !era.value || !dapps.value) return;
    let isPendingWithdrawal = false;
    let stakingData: MyStakeInfo[] = [];
    const mappedSS58Address = toSS58Address(selectedEvmAddress.value);
    const dappStakingService = container.get<IDappStakingService>(Symbols.DappStakingService);

    // Memo: check if there are any dapps staked
    await Promise.all(
      dapps.value.map(async (it: DappCombinedInfo) => {
        const stakeData = await dappStakingService.getStakeInfo(
          it.dapp?.address!,
          mappedSS58Address
        );
        if (stakeData?.hasStake) {
          stakingData.push({ ...stakeData, ...it.dapp });
        }
        return stakeData;
      })
    );

    // Memo: check if there are any pending withdrawals
    const ledger = await dappStakingService.getLedger(mappedSS58Address);
    if (ledger.unbondingInfo.unlockingChunks) {
      const pendingWithdrawals = ledger.unbondingInfo.unlockingChunks;
      isPendingWithdrawal = pendingWithdrawals.length > 0;
    }

    // Memo: check if there are any rewards need to be claimed
    const claimTransactions = await Promise.all(
      dapps.value.map(async (it) => {
        try {
          const dappAddress = it.dapp ? it.dapp.address : it.contract.address;
          if (dappAddress) {
            const transactions = await getIndividualClaimTxs({
              dappAddress,
              api: $api!,
              senderAddress: mappedSS58Address,
              currentEra: era.value,
            });
            return transactions.length ? transactions : null;
          } else {
            return null;
          }
        } catch (error) {
          console.error(error);
          return null;
        }
      })
    );
    const eraPendingRewards = claimTransactions.filter((it) => it !== null).flat();

    if (isPendingWithdrawal || stakingData.length > 0 || eraPendingRewards.length > 0) {
      isStaking.value = true;
    } else {
      isStaking.value = false;
    }
  };

  watch([currentAccount], setWeb3, { immediate: true });
  watch([selectedEvmAddress, web3], updateEvmProvider);
  watch([selectedEvmAddress, dapps, era], checkStakerInfo);

  watchEffect(() => {
    console.log('selectedEvmAddress', selectedEvmAddress.value);
    console.log('isConnectedNetwork', isConnectedNetwork.value);
    console.log('isStaking', isStaking.value);
  });

  return { selectedEvmAddress, isConnectedNetwork, isStaking, setWeb3 };
};
