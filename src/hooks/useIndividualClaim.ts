import { getAddressEnum } from './../store/dapp-staking/actions';
import api, { $api } from 'boot/api';
import { getInjector } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { computed, watchEffect } from 'vue';
import { useCustomSignature } from '.';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';

export function useIndividualClaim(dappAddress: string) {
  const store = useStore();
  const isH160 = computed(() => store.getters['general/isH160Formatted']);
  const senderAddress = computed(() => store.getters['general/selectedAddress']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);

  const { callFunc, handleResult, handleTransactionError, dispatchError } = useCustomSignature();

  const getClaimStakerData = (address: string) => {
    return $api?.value?.tx.dappsStaking.claimStaker(getAddressEnum(address));
  };
  const getClaimDappData = async (address: string) => {
    const data = await $api?.value?.query.dappsStaking.contractEraStake(
      getAddressEnum(address),
      null
    );
    // @ts-ignore
    const d = data.entries();
    console.log('d', d);
    console.log('data', data);
    console.log('data.toJSON()', data?.toJSON());
    // return $api?.value?.tx.dappsStaking.claimStaker(getAddressEnum(address));
  };

  watchEffect(async () => {
    await getClaimDappData(dappAddress);
  });

  const individualClaim = async () => {
    if (!isH160.value) {
      const transactions: SubmittableExtrinsic<'promise', ISubmittableResult>[] = [];
      const stakerData = getClaimStakerData(dappAddress);
      if (!stakerData) {
        throw Error('No rewards to claim');
      }

      try {
        transactions.push(stakerData);
        const injector = await getInjector(substrateAccounts.value);

        await $api?.value?.tx.utility
          .batch(transactions)
          .signAndSend(
            senderAddress.value,
            {
              signer: injector?.signer,
              // Memo: check if it is ok to remove nonce: -1
              nonce: -1,
            },
            (result) => {
              handleResult(result);
            }
          )
          .catch((error: Error) => {
            handleTransactionError(error);
          });
      } catch (error: any) {
        console.error(error.message);
        dispatchError(error.message);
      }
    }
  };

  return { individualClaim };
}
