import { $api } from 'boot/api';
import { useCurrentEra, useCustomSignature } from 'src/hooks';
import { TxType } from 'src/hooks/custom-signature/message';
import { getIndividualClaimTxs, PayloadWithWeight } from 'src/hooks/helper/claim';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import { IDappStakingService, IExtrinsicCallService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { computed, ref, watchEffect } from 'vue';
import { useEvmAccount } from 'src/hooks/custom-signature/useEvmAccount';

export function useClaimAll() {
  let batchTxs: PayloadWithWeight[] = [];
  const amountOfEras = ref<number>(0);
  const canClaim = ref<boolean>(false);
  const canClaimWithoutError = ref<boolean>(true);
  const isLoading = ref<boolean>(true);
  const store = useStore();
  const senderAddress = computed(() => store.getters['general/selectedAddress']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const dapps = computed<DappCombinedInfo[]>(() => store.getters['dapps/getAllDapps']);
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
  const isSendingTx = computed(() => store.getters['general/isLoading']);
  const currentEcdsaAccount = computed(() => store.getters['general/currentEcdsaAccount']);
  const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
  const { requestSignature } = useEvmAccount();

  const { era } = useCurrentEra();
  const { isCustomSig } = useCustomSignature({
    txType: TxType.dappsStaking,
  });

  watchEffect(async () => {
    try {
      isLoading.value = true;
      const api = $api;
      const senderAddressRef = senderAddress.value;
      if (!api) {
        throw Error('Failed to connect to API');
      }
      if (!senderAddressRef || !era.value || isSendingTx.value) {
        return;
      }

      const txs = await Promise.all(
        dapps.value.map(async (it) => {
          if (it.dapp && !isH160.value) {
            const transactions = await getIndividualClaimTxs({
              dappAddress: it?.dapp?.address,
              api,
              senderAddress: senderAddressRef,
              currentEra: era.value,
            });

            return transactions.length ? transactions : null;
          } else {
            return null;
          }
        })
      );
      const filteredTxs = txs.filter((it) => it !== null);
      batchTxs = filteredTxs.flat() as PayloadWithWeight[];
      canClaim.value = batchTxs.length > 0;
      amountOfEras.value = batchTxs.length;

      const dappStakingService = container.get<IDappStakingService>(Symbols.DappStakingService);
      canClaimWithoutError.value = await dappStakingService.canClaimRewardWithoutErrors(
        senderAddress.value
      );
    } catch (error: any) {
      console.error(error.message);
    } finally {
      isLoading.value = false;
    }
  });

  const claimAll = async (): Promise<void> => {
    try {
      const dappStakingService = container.get<IDappStakingService>(Symbols.DappStakingService);
      if (isCustomSig.value) {
        const extrinsic = await dappStakingService.getTxsToExecuteForClaim(batchTxs);
        const extrinsicCallService = container.get<IExtrinsicCallService>(
          Symbols.ExtrinsicCallService
        );

        await extrinsicCallService.callCustomExtrinsic(
          extrinsic,
          currentEcdsaAccount.value,
          currentNetworkIdx.value,
          requestSignature
        );
      } else {
        await dappStakingService.claimAll({
          batchTxs,
          senderAddress: senderAddress.value,
          substrateAccounts: substrateAccounts.value,
        });
      }
    } catch (error: any) {
      console.error(error.message);
    }
  };

  return {
    claimAll,
    canClaim,
    canClaimWithoutError,
    isLoading,
    amountOfEras,
  };
}
