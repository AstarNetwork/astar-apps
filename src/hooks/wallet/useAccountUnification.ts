import { $api } from 'boot/api';
import { setupNetwork } from 'src/config/web3';
import { useAccount } from 'src/hooks/useAccount';
import { useStore } from 'src/store';
import { WatchCallback, computed, ref, watch, watchEffect } from 'vue';
import Web3 from 'web3';
import { useNetworkInfo } from '../useNetworkInfo';

import {
  ExtrinsicPayload,
  PayloadWithWeight,
  getIndividualClaimTxs,
  toSS58Address,
} from '@astar-network/astar-sdk-core';
import { MyStakeInfo, useCurrentEra } from 'src/hooks';
import { container } from 'src/v2/common';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import { IDappStakingService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';

import { BN } from '@polkadot/util';
import ABI from 'src/config/abi/ERC20.json';
import { AbiItem } from 'web3-utils';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { XcmAssets } from 'src/store/assets/state';
import { Asset } from 'src/v2/models';

const provider = window.ethereum;

export interface TransferXc20Token {
  assetId: string;
  balance: string;
  symbol: string;
  tokenImage: string;
}

export const useAccountUnification = () => {
  const web3 = ref<Web3>();
  const selectedEvmAddress = ref<string>('');
  const isConnectedNetwork = ref<boolean>(false);
  const isReadyUnification = ref<boolean>(false);
  const isStaking = ref<boolean>(true);
  const transferXc20CallData = ref<string>('');
  const transferXc20tokens = ref<TransferXc20Token[]>([]);

  const store = useStore();
  const { currentAccount } = useAccount();
  const { evmNetworkIdx } = useNetworkInfo();
  const { era } = useCurrentEra();

  const dapps = computed<DappCombinedInfo[]>(() => store.getters['dapps/getAllDapps']);
  const xcmAssets = computed<XcmAssets>(() => store.getters['assets/getAllAssets']);

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
    try {
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
    } catch (error) {
      console.error(error);
      isStaking.value = true;
    }
  };

  const setTransferXc20CallData = async (): Promise<void> => {
    const MAX_BATCH_WEIGHT = new BN('50000000000'); // Memo: ≒56 transactions
    try {
      console.log('xcmAssets.value', xcmAssets.value);
      if (!currentAccount.value || !xcmAssets.value.assets.length || !web3.value) {
        return;
      }
      isReadyUnification.value = false;
      const web3Provider = web3.value as Web3;
      const from = selectedEvmAddress.value;
      const xc20tokens = await Promise.all(
        xcmAssets.value.assets.map(async (asset: Asset) => {
          try {
            if (!asset.mappedERC20Addr || !asset.metadata.symbol) return null;
            const contract = new web3Provider.eth.Contract(ABI as AbiItem[], asset.mappedERC20Addr);
            const balance = (await contract.methods.balanceOf(from).call()) ?? ('0' as string);
            const evmData = {
              assetId: asset.id,
              balance,
              symbol: asset.metadata.symbol,
              tokenImage: asset.tokenImage,
            };
            return Number(balance) > 0 ? evmData : null;
          } catch (error) {
            console.error(error);
            return null;
          }
        })
      );

      transferXc20tokens.value = xc20tokens.filter((it) => it !== null) as TransferXc20Token[];
      console.log('transferXc20tokens.value ', transferXc20tokens.value);

      const unifiedSs58Address = currentAccount.value;

      const transactions = transferXc20tokens.value
        .map((it) => {
          if (!it) return null;
          const assetId = it.assetId;
          const receivingAddress = unifiedSs58Address;
          const amount = it.balance;
          return $api?.tx.assets.transfer(new BN(assetId), receivingAddress, amount);
        })
        .filter((it) => it !== null) as SubmittableExtrinsic<'promise', ISubmittableResult>[];

      if (transactions.length > 0) {
        const txsToExecute: ExtrinsicPayload[] = [];
        let totalWeight: BN = new BN('0');
        for (const data of transactions) {
          const paymentInfo = await data.paymentInfo(unifiedSs58Address);
          const tx = new PayloadWithWeight(data, paymentInfo.weight);
          const weight = tx.asWeightV2().refTime.toBn();
          if (totalWeight.add(weight).gt(MAX_BATCH_WEIGHT)) break;

          txsToExecute.push(tx.payload as ExtrinsicPayload);
          totalWeight = totalWeight.add(weight);
        }

        console.info(
          `Batch weight: ${totalWeight.toString()}, transactions no. ${txsToExecute.length}`
        );

        const batchedTx = $api?.tx.utility.batch(transactions) as SubmittableExtrinsic<
          'promise',
          ISubmittableResult
        >;
        transferXc20CallData.value = batchedTx.method.toHex();
      } else {
        transferXc20CallData.value = '';
        transferXc20tokens.value = [];
        isReadyUnification.value = true;
      }

      console.log('transferXc20CallData.value', transferXc20CallData.value);
      // step1: use dispatch precompiled to send the calldata
      // step2: check the 'xc20tokens' balance again. Repeat the process again if there still have some balance
      // step3: add this logic to Astar.js
    } catch (error) {
      console.error(error);
      transferXc20CallData.value = '';
      transferXc20tokens.value = [];
      isReadyUnification.value = false;
    }
  };

  watch([currentAccount], setWeb3, { immediate: true });
  watch([selectedEvmAddress, web3], updateEvmProvider);
  watch([selectedEvmAddress, dapps, era], checkStakerInfo);
  watch([xcmAssets, web3], setTransferXc20CallData);

  // Memo: delete it later
  watchEffect(() => {
    console.log('selectedEvmAddress', selectedEvmAddress.value);
    console.log('isConnectedNetwork', isConnectedNetwork.value);
    console.log('isStaking', isStaking.value);
  });

  return { selectedEvmAddress, isConnectedNetwork, isStaking, isReadyUnification, setWeb3 };
};
