import {
  ExtrinsicPayload,
  PayloadWithWeight,
  getIndividualClaimTxs,
  wait,
  checkSumEvmAddress,
} from '@astar-network/astar-sdk-core';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { BN } from '@polkadot/util';
import { $api } from 'boot/api';
import { ethers } from 'ethers';
import { get } from 'lodash-es';
import ABI from 'src/config/abi/ERC20.json';
import { setupNetwork } from 'src/config/web3';
import { MyStakeInfo, useCurrentEra } from 'src/hooks';
import { useAccount } from 'src/hooks/useAccount';
import { getEvmExplorerUrl } from 'src/links';
import { evmPrecompiledContract } from 'src/modules/precompiled';
import { AlertMsg } from 'src/modules/toast';
import { useStore } from 'src/store';
import { XcmAssets } from 'src/store/assets/state';
import { container } from 'src/v2/common';
import { ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';
import { Asset } from 'src/v2/models';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import { IAccountUnificationService, IDappStakingService, IIdentityService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { WatchCallback, computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { useNetworkInfo } from '../useNetworkInfo';
import { IAccountUnificationRepository, IIdentityRepository } from 'src/v2/repositories';
import { UnifiedAccount } from 'src/store/general/state';
import { getRawEvmTransaction } from 'src/modules/evm';

const provider = get(window, 'ethereum') as any;

export interface TransferXc20Token {
  assetId: string;
  balance: string;
  formattedBalance: number;
  name: string;
  symbol: string;
  tokenImage: string;
}

export const useAccountUnification = () => {
  const web3 = ref<Web3>();
  const selectedEvmAddress = ref<string>('');
  const isConnectedNetwork = ref<boolean>(false);
  const isReadyUnification = ref<boolean>(false);
  const isFetchingXc20Tokens = ref<boolean>(false);
  const isSendingXc20Tokens = ref<boolean>(false);
  const isLoadingDappStaking = ref<boolean>(false);
  const accountName = ref<string>('');
  const isStaking = ref<boolean>(false);
  const transferXc20CallData = ref<string>('');
  const transferXc20Tokens = ref<TransferXc20Token[]>([]);

  const store = useStore();
  const { currentAccount } = useAccount();
  const { evmNetworkIdx, nativeTokenSymbol } = useNetworkInfo();
  const { era } = useCurrentEra();
  const { t } = useI18n();

  const dapps = computed<DappCombinedInfo[]>(() => store.getters['dapps/getAllDapps']);
  const xcmAssets = computed<XcmAssets>(() => store.getters['assets/getAllAssets']);

  const unifiedAccount = computed<UnifiedAccount | undefined>(
    () => store.getters['general/getUnifiedAccount']
  );
  const isAccountUnified = computed<boolean>(() => {
    return !!(unifiedAccount.value !== undefined && unifiedAccount.value.name);
  });

  const setAccountName = (event: any) => {
    accountName.value = typeof event === 'string' ? event : event.target.value;
  };

  const setWeb3 = async (): Promise<void> => {
    if (!provider || typeof window.ethereum === 'undefined') return;
    const [address] = (await provider.request({ method: 'eth_requestAccounts' })) as string;
    web3.value = new Web3(provider as any);
    selectedEvmAddress.value = checkSumEvmAddress(address);
    const chainId = `0x${evmNetworkIdx.value.toString(16)}`;
    if (provider.chainId !== chainId) {
      await setupNetwork({ network: evmNetworkIdx.value, provider });
    }
    isConnectedNetwork.value = provider.chainId === chainId;
  };

  const updateEvmProvider: WatchCallback<[Web3?]> = ([web3], _, registerCleanup) => {
    if (!currentAccount || !web3 || !provider || typeof window.ethereum === 'undefined') {
      return;
    }

    const handleAccountsChanged = async (): Promise<void> => {
      await setWeb3();
    };

    const handleChainChanged = (): void => {
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

  const checkStakerInfo = async (): Promise<void> => {
    if (!selectedEvmAddress.value || !era.value || !dapps.value) return;
    const accountUnificationService = container.get<IAccountUnificationService>(
      Symbols.AccountUnificationService
    );
    try {
      isLoadingDappStaking.value = true;
      let isPendingWithdrawal = false;
      let stakingData: MyStakeInfo[] = [];

      const mappedSS58Address = await accountUnificationService.getConvertedNativeAddress(
        selectedEvmAddress.value
      );
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
          } finally {
            // Memo: give some time to sync in modals UI
            await wait(500);
            isLoadingDappStaking.value = false;
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
      isFetchingXc20Tokens.value = true;
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
              formattedBalance: Number(ethers.utils.formatUnits(balance, asset.metadata.decimals)),
              name: asset.metadata.name,
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

      transferXc20Tokens.value = xc20tokens.filter((it) => it !== null) as TransferXc20Token[];

      const unifiedSs58Address = currentAccount.value;

      const transactions = transferXc20Tokens.value
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

        const batchedTx = $api?.tx.utility.batch(txsToExecute) as SubmittableExtrinsic<
          'promise',
          ISubmittableResult
        >;
        transferXc20CallData.value = batchedTx.method.toHex();
      } else {
        transferXc20CallData.value = '';
        transferXc20Tokens.value = [];
        isReadyUnification.value = true;
      }
    } catch (error) {
      console.error(error);
      transferXc20CallData.value = '';
      transferXc20Tokens.value = [];
      isReadyUnification.value = false;
    } finally {
      isFetchingXc20Tokens.value = false;
    }
  };

  const handleTransferXc20Tokens = async (): Promise<void> => {
    if (!web3.value || !transferXc20CallData.value) return;
    const eventAggregator = container.get<IEventAggregator>(Symbols.EventAggregator);
    try {
      isSendingXc20Tokens.value = true;
      const from = selectedEvmAddress.value;
      const rawTx = await getRawEvmTransaction(
        web3.value,
        from,
        evmPrecompiledContract.dispatch,
        transferXc20CallData.value,
        '0x0'
      );

      const estimatedGas = await web3.value.eth.estimateGas(rawTx);
      await web3.value.eth
        .sendTransaction({ ...rawTx, gas: estimatedGas })
        .once('transactionHash', (transactionHash) => {
          eventAggregator.publish(
            new ExtrinsicStatusMessage({
              success: true,
              message: t('wallet.unifiedAccount.sendingXc20'),
            })
          );
        })
        .then(async ({ transactionHash }) => {
          const explorerUrl = await getEvmExplorerUrl(transactionHash, web3.value as Web3);
          eventAggregator.publish(
            new ExtrinsicStatusMessage({
              success: true,
              message: AlertMsg.SUCCESS,
              explorerUrl,
            })
          );
          return transactionHash;
        })
        .catch((error: any) => {
          console.error(error);
          eventAggregator.publish(
            new ExtrinsicStatusMessage({
              success: false,
              message: error.message || AlertMsg.ERROR,
            })
          );
        });
    } catch (error) {
      console.error(error);
    } finally {
      await setTransferXc20CallData();
      isSendingXc20Tokens.value = false;
    }
  };

  const unifyAccounts = async (
    nativeAddress: string,
    evmAddress: string,
    accountName: string,
    avatarContractAddress?: string,
    avatarId?: string
  ): Promise<boolean> => {
    const unificationService = container.get<IAccountUnificationService>(
      Symbols.AccountUnificationService
    );

    return unificationService.unifyAccounts(
      nativeAddress,
      evmAddress,
      accountName,
      avatarContractAddress,
      avatarId
    );
  };

  const updateAccount = async (
    nativeAddress: string,
    accountName: string,
    avatarContractAddress?: string,
    avatarTokenId?: string
  ): Promise<void> => {
    const identityService = container.get<IIdentityService>(Symbols.IdentityService);
    await identityService.setIdentity(
      nativeAddress,
      identityService.createIdentityData(accountName, avatarContractAddress, avatarTokenId)
    );
  };

  const getCost = async (): Promise<string> => {
    const TOTAL_FIELDS = 5; // account name, avatar address key, avatar address value, token id key, token id value
    const identityRepository = container.get<IIdentityRepository>(Symbols.IdentityRepository);
    const auRepository = container.get<IAccountUnificationRepository>(
      Symbols.AccountUnificationRepository
    );
    const [depositInfo, mappingFee] = await Promise.all([
      identityRepository.getDepositInfo(),
      auRepository.getUnificationFee(),
    ]);
    const totalDeposit = depositInfo.basic + depositInfo.field * BigInt(TOTAL_FIELDS) + mappingFee;

    return `${ethers.utils.formatEther(totalDeposit.toString())} ${nativeTokenSymbol.value}`;
  };

  watch([web3], updateEvmProvider);
  watch([selectedEvmAddress, dapps, era], checkStakerInfo);
  watch([xcmAssets, web3], setTransferXc20CallData);

  return {
    selectedEvmAddress,
    isConnectedNetwork,
    isStaking,
    isReadyUnification,
    transferXc20Tokens,
    isFetchingXc20Tokens,
    isLoadingDappStaking,
    accountName,
    isSendingXc20Tokens,
    unifiedAccount,
    isAccountUnified,
    setAccountName,
    setWeb3,
    handleTransferXc20Tokens,
    unifyAccounts,
    getCost,
    updateAccount,
  };
};
