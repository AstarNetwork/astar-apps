import {
  ExtrinsicPayload,
  PayloadWithWeight,
  getIndividualClaimTxs,
} from '@astar-network/astar-sdk-core';
import { ISubmittableResult } from '@polkadot/types/types';
import { BN } from '@polkadot/util';
import { $api } from 'boot/api';
import { ethers } from 'ethers';
import { useBalance, useCurrentEra, useLedger } from 'src/hooks';
import { TxType, displayCustomMessage } from 'src/hooks/custom-signature/message';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import { IDappStakingService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { computed, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const MAX_BATCH_WEIGHT = new BN('50000000000'); // Memo: ≒56 eras
const MAX_BATCH_WEIGHT_LEDGER = new BN('6000000000'); //Memo: 6 eras
const MAX_BATCH_WEIGHT_LEDGER_S = new BN('2000000000'); //Memo:2 eras

export function useClaimAll() {
  let batchTxs: PayloadWithWeight[] = [];
  const amountOfEras = ref<number>(0);
  const canClaim = ref<boolean>(false);
  const canClaimWithoutError = ref<boolean>(true);
  const isLoading = ref<boolean>(false);
  const store = useStore();
  const route = useRoute();

  const senderAddress = computed(() => store.getters['general/selectedAddress']);
  const dapps = computed<DappCombinedInfo[]>(() => store.getters['dapps/getAllDapps']);
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
  const isSendingTx = computed(() => store.getters['general/isLoading']);
  const isLedger = computed<boolean>(() => store.getters['general/isLedger']);
  const { t } = useI18n();
  const { era } = useCurrentEra();
  const { accountData } = useBalance(senderAddress);
  const { isLedgerNanoS } = useLedger();
  const multisigAccount = computed<string>(() => route.query.multisig as string);
  const claimAccount = computed<string>(() =>
    multisigAccount.value ? multisigAccount.value : senderAddress.value
  );

  const maxBatchWeight = computed<BN>(() => {
    if (isLedger.value) {
      return isLedgerNanoS.value ? MAX_BATCH_WEIGHT_LEDGER_S : MAX_BATCH_WEIGHT_LEDGER;
    } else {
      return MAX_BATCH_WEIGHT;
    }
  });

  const transferableBalance = computed(() => {
    const balance = accountData.value
      ? ethers.utils.formatEther(accountData.value.getUsableTransactionBalance().toString())
      : '0';
    return Number(balance);
  });

  const updateClaimEras = async (): Promise<void> => {
    try {
      isLoading.value = true;
      const api = $api;
      const senderAddressRef = claimAccount.value;
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
  };

  watch([isSendingTx, senderAddress, era, claimAccount], updateClaimEras);

  const claimAll = async (): Promise<void> => {
    const api = $api;
    const batchTxsRef = batchTxs;

    if (!api) {
      throw Error('Failed to connect to API');
    }
    if (0 >= batchTxsRef.length) {
      throw Error('No dApps can be claimed');
    }

    const txsToExecute: ExtrinsicPayload[] = [];
    let totalWeight: BN = new BN('0');
    for (let i = 0; i < batchTxsRef.length; i++) {
      const tx = batchTxsRef[i];
      const weight = tx.isWeightV2 ? tx.asWeightV2().refTime.toBn() : tx.asWeightV1();
      if (totalWeight.add(weight).gt(maxBatchWeight.value)) {
        break;
      }

      txsToExecute.push(tx.payload as ExtrinsicPayload);
      totalWeight = totalWeight.add(weight);
    }

    console.info(
      `Batch weight: ${totalWeight.toString()}, transactions no. ${txsToExecute.length}`
    );
    const transaction = api.tx.utility.batch(txsToExecute);
    const info = await api.tx.utility.batch(txsToExecute).paymentInfo(senderAddress.value);
    const partialFee = info.partialFee.toBn();
    const balance = new BN(
      ethers.utils.parseEther(transferableBalance.value.toString()).toString()
    );

    if (balance.sub(partialFee.muln(1.5)).isNeg()) {
      store.dispatch('general/showAlertMsg', {
        msg: t('dappStaking.error.invalidBalance'),
        alertType: 'error',
      });
      return;
    }

    const finalizedCallback = (result: ISubmittableResult): void => {
      displayCustomMessage({
        txType: TxType.dappsStaking,
        result,
        senderAddress: senderAddress.value,
        store,
        t,
      });
    };

    try {
      const dappStakingService = container.get<IDappStakingService>(Symbols.DappStakingService);
      await dappStakingService.sendTx({
        senderAddress: senderAddress.value,
        transaction,
        finalizedCallback,
      });
    } catch (error: any) {
      console.error(error.message);
    }
  };

  watchEffect(() => {
    console.log('multisigAccount', multisigAccount.value);
  });

  // watchEffect(async () => {
  //   const api = $api!;
  //   const addresses = [
  //     'axodJWpkSi9E5k7SgewYCCnTMZw3y6n79nuLevTCGFt7ADw',
  //     'WkuMXKG2tLL2T2MLuD7JxzFaLVDFcEpg7JxZirCFbSzeovY',
  //     'avf5nPmTfztUfq3gi1Bm3vBcEUHghUyrqRppXmsmDZ5hfrD',
  //   ];
  //   const threshold = 2;
  //   const index = 0;
  //   const recipient = 'XV15MJAbMLPKawqPnLkNshePY7RsaS7ZXyFUys51BH3rvQw';
  //   // const amount = BigInt(1e12);  // 1 ASTR token, assuming 12 decimal places
  //   const amount = '1000000000000000000'; // 1 ASTR token, assuming 12 decimal places

  //   // Create the multisig address
  //   const multiAddress = createKeyMulti(addresses, threshold);
  //   const Ss58Address = encodeAddress(multiAddress, 5);

  //   console.log(`\nMultisig Address: ${Ss58Address}`);

  //   // Prepare other signatories
  //   const otherSignatories = addresses.filter((who) => who !== addresses[index]);
  //   const otherSignatoriesSorted = sortAddresses(otherSignatories, 5);

  //   console.log(`\nOther Signatories: ${otherSignatoriesSorted}\n`);

  //   // Prepare the transfer call
  //   // const transferCall = api.tx.balances.transferKeepAlive(recipient, amount);
  //   const transferCall = api.tx.dappsStaking.bondAndStake(
  //     { Evm: '0xba939477113e01637cca0be3a3a2b9b543660d68' },
  //     '5000000000000000000'
  //   );

  //   const info = await transferCall.paymentInfo(addresses[0]);
  //   const weight = new PayloadWithWeight(transferCall, info.weight);
  //   // Create the multisig call
  //   const multisigCall = api.tx.multisig.asMulti(
  //     threshold,
  //     otherSignatoriesSorted,
  //     null,
  //     transferCall,
  //     weight.asWeightV2()
  //   );
  //   // console.log('multisigCall',multisigCall.)

  //   const txResHandler = async (result: ISubmittableResult): Promise<boolean> => {
  //     console.log('result', result);
  //     return true;
  //   };

  //   const hexCallData = transferCall.method.toHex();
  //   console.log('hexCallData', hexCallData);

  //   await signAndSend({
  //     transaction: multisigCall,
  //     senderAddress: addresses[0],
  //     substrateAccounts: substrateAccounts.value,
  //     isCustomSignature: false,
  //     txResHandler,
  //     dispatch: store.dispatch,
  //   });
  // });

  return {
    claimAll,
    canClaim,
    canClaimWithoutError,
    isLoading,
    amountOfEras,
  };
}
