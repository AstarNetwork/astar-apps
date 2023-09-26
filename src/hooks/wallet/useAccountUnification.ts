import { setupNetwork } from 'src/config/web3';
import { useAccount } from 'src/hooks/useAccount';
import { useStore } from 'src/store';
import { ref, watch, WatchCallback, watchEffect } from 'vue';
import Web3 from 'web3';
import { useNetworkInfo } from '../useNetworkInfo';

import { MyStakeInfo, StakeInfo } from 'src/store/dapp-staking/actions';
import { container } from 'src/v2/common';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import { IDappStakingService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';

const provider = window.ethereum;

export const useAccountUnification = () => {
  const web3 = ref<Web3>();
  const selectedEvmAddress = ref<string>('');
  const isConnectedNetwork = ref<boolean>(false);

  const store = useStore();
  const { currentAccount } = useAccount();
  const { evmNetworkIdx } = useNetworkInfo();

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

  // const setStakeInfo = async () => {
  //   let data: StakeInfo[] = [];
  //   let myData: MyStakeInfo[] = [];
  //   const mappedSS58Address = selectedEvmAddress

  //   const dappStakingService = container.get<IDappStakingService>(Symbols.DappStakingService);
  //   data = await Promise.all<StakeInfo>(
  //     dapps.value.map(async (it: DappCombinedInfo) => {
  //       const stakeData = await dappStakingService.getStakeInfo(
  //         it.dapp?.address!,
  //         currentAccount.value
  //       );
  //       if (stakeData?.hasStake) {
  //         myData.push({ ...stakeData, ...it.dapp });
  //       }
  //       return stakeData;
  //     })
  //   );

  //   stakeInfos.value = data;
  //   myStakeInfos.value = myData;
  // };

  watch([currentAccount], setWeb3, { immediate: true });
  watch([selectedEvmAddress, web3], updateEvmProvider);

  watchEffect(() => {
    console.log('selectedEvmAddress', selectedEvmAddress.value);
    console.log('isConnectedNetwork', isConnectedNetwork.value);
  });

  return { selectedEvmAddress, isConnectedNetwork, setWeb3 };
};
