import { addXcmTxHistories } from './../../modules/xcm/utils/index';
import { isValidEvmAddress } from './../../config/web3/utils/convert';
import BN from 'bn.js';
import { ethers } from 'ethers';
import xcmContractAbi from 'src/config/web3/abi/xcm-abi.json';
import { isValidAddressPolkadotAddress } from 'src/hooks/helper/plasmUtils';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import { getEvmGas } from 'src/modules/gas-api';
import { useStore } from 'src/store';
import { computed, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { getPubkeyFromSS58Addr } from '../helper/addressUtils';
import { useAccount } from '../useAccount';
import { useGasPrice } from '../useGasPrice';
import { Chain, relaychainParaId, xcmChainObj } from './../../modules/xcm/index';
import { Asset } from 'src/v2/models';
import { MOVR } from 'src/modules/token';
import { useNetworkInfo } from '../useNetworkInfo';

// xcm precompiled contract address
const PRECOMPILED_ADDR = '0x0000000000000000000000000000000000005004';

export function useXcmEvm(selectedToken: Ref<Asset>) {
  const store = useStore();
  const { t } = useI18n();
  const { evmGasPrice } = useGasPrice();
  const { currentAccount } = useAccount();
  const { currentNetworkName } = useNetworkInfo();

  const currentWallet = computed(() => store.getters['general/currentWallet']);
  const isMoonbeamWithdrawal = computed<boolean>(() => {
    return selectedToken.value.mappedERC20Addr === MOVR.address;
  });

  const callAssetWithdrawToPara = async (
    asset_amount: string,
    recipient_account_id: string,
    finalizedCallback: () => Promise<void>
  ): Promise<string | null> => {
    return new Promise<string | null>(async (resolve) => {
      if (!asset_amount) {
        throw Error('Invalid amount');
      }

      const isValidDestAddress =
        (!isMoonbeamWithdrawal.value && isValidAddressPolkadotAddress(recipient_account_id)) ||
        (isMoonbeamWithdrawal.value && isValidEvmAddress(recipient_account_id));
      if (!isValidDestAddress) {
        throw Error('Invalid destination address');
      }

      store.commit('general/setLoading', true);

      const asset_id = selectedToken.value.mappedERC20Addr;
      const decimal = Number(selectedToken.value.metadata.decimals);
      const assetAmount = ethers.utils.parseUnits(asset_amount, decimal).toString();
      const recipientEvmAccountId = getPubkeyFromSS58Addr(recipient_account_id);
      const assetIds = [asset_id];
      const assetAmounts = [new BN(assetAmount)];
      const recipientAccountId = recipientEvmAccountId;
      const withdrawalChain = xcmChainObj[selectedToken.value.originChain as Chain];
      const isRelay = Number(withdrawalChain && withdrawalChain.parachainId) === relaychainParaId;
      const parachainId = withdrawalChain?.parachainId;
      const feeIndex = 0;

      try {
        const provider = getEvmProvider(currentWallet.value);
        const web3 = new Web3(provider as any);
        const contract = new web3.eth.Contract(xcmContractAbi as AbiItem[], PRECOMPILED_ADDR);
        const [nonce, gasPrice] = await Promise.all([
          web3.eth.getTransactionCount(currentAccount.value),
          getEvmGas(web3, evmGasPrice.value.fast),
        ]);

        const rawTx: TransactionConfig = {
          nonce,
          gasPrice: web3.utils.toHex(gasPrice),
          from: currentAccount.value,
          to: PRECOMPILED_ADDR,
          value: '0x0',
          data: contract.methods
            .assets_withdraw(
              assetIds,
              assetAmounts,
              recipientAccountId,
              isRelay,
              parachainId,
              feeIndex
            )
            .encodeABI(),
        };

        const estimatedGas = await web3.eth.estimateGas(rawTx);
        await web3.eth
          .sendTransaction({ ...rawTx, gas: estimatedGas })
          .then(({ transactionHash }) => {
            store.commit('general/setLoading', false);
            store.dispatch('general/showAlertMsg', {
              msg: t('toast.completedTxHash', { hash: transactionHash }),
              alertType: 'success',
            });
            addXcmTxHistories({
              hash: transactionHash,
              from: currentNetworkName.value,
              to: withdrawalChain.name,
              symbol: selectedToken.value.metadata.symbol,
              amount: asset_amount,
              address: currentAccount.value,
            });
            finalizedCallback();
            resolve(transactionHash);
          });
      } catch (e: any) {
        console.error(e);
        store.commit('general/setLoading', false);
        store.dispatch('general/showAlertMsg', {
          msg: `Transaction failed with error: ${e.message}`,
          alertType: 'error',
        });
        resolve(null);
      }
    });
  };

  return {
    callAssetWithdrawToPara,
  };
}
