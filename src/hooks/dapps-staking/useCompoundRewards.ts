import { useI18n } from 'vue-i18n';
import { Struct, u32, Vec } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import BN from 'bn.js';
import { $api } from 'boot/api';
import { useCustomSignature, useGasPrice } from 'src/hooks';
import { signAndSend } from 'src/hooks/helper/wallet';
import { hasExtrinsicFailedEvent } from 'src/modules/extrinsic';
import { useStore } from 'src/store';
import { computed, ref, watchEffect } from 'vue';
import { checkIsDappOwner, getNumberOfUnclaimedEra } from '../helper/claim';
import { useCurrentEra } from '../useCurrentEra';

type EraIndex = u32;

export enum RewardDestination {
  FreeBalance = 'FreeBalance',
  StakeBalance = 'StakeBalance',
}

interface UnlockingChunk extends Struct {
  amount: Balance;
  unlockEra: EraIndex;
}

interface UnbondingInfo extends Struct {
  unlockingChunks: Vec<UnlockingChunk>;
}

export interface AccountLedger extends Struct {
  locked: Balance;
  unbondingInfo: UnbondingInfo;
  rewardDestination: RewardDestination;
}

export function useCompoundRewards() {
  const store = useStore();
  const { t } = useI18n();
  const { isCustomSig, handleCustomExtrinsic } = useCustomSignature({});
  const currentAddress = computed(() => store.getters['general/selectedAddress']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const dapps = computed(() => store.getters['dapps/getAllDapps']);
  const { selectedTip } = useGasPrice();
  const { era } = useCurrentEra();

  const isSupported = ref<boolean>(false);
  const isCompounding = ref<boolean>(false);
  const isStaker = ref<boolean>(false);
  const isUnclaimedEra = ref<boolean>(false);
  const isDappOwner = ref<boolean>(false);
  const rewardDestination = ref<RewardDestination>(RewardDestination.FreeBalance);

  const getCompoundingType = async () => {
    try {
      // Check if metadata contains set_reward_destination so we know
      // if compounding is supported by a node or not.
      const metadata = $api?.runtimeMetadata;
      const metadataJson = JSON.stringify(metadata?.toJSON());
      isSupported.value = metadataJson.includes('set_reward_destination');

      // Subscribe to compounding data.
      await $api?.query.dappsStaking.ledger(currentAddress.value, (ledger: AccountLedger) => {
        if (ledger && isSupported.value) {
          rewardDestination.value = ledger.rewardDestination;
          isCompounding.value =
            ledger.rewardDestination.toString() === RewardDestination.StakeBalance;
        }

        isStaker.value = !ledger.locked.eq(new BN(0));
      });
    } catch (err) {
      // Compounding rewards are not supported by a node if reading of ledger.rewardDestination fails
      // or in case of error while querying ledger value.
      console.warn(err);
    }
  };

  const setRewardDestination = async (rewardDestination: RewardDestination): Promise<void> => {
    try {
      const transaction = $api!.tx.dappsStaking.setRewardDestination(rewardDestination);
      const txResHandler = async (result: ISubmittableResult): Promise<boolean> => {
        return new Promise<boolean>(async (resolve) => {
          if (result.status.isFinalized) {
            let errorMessage = '';
            if (
              !hasExtrinsicFailedEvent(
                result.events,
                store.dispatch,
                (message: string) => (errorMessage = message)
              )
            ) {
              store.dispatch(
                'general/showAlertMsg',
                {
                  msg: t('dappStaking.toast.successfullySetRewardDest'),
                  alertType: 'success',
                },
                { root: true }
              );
              resolve(true);
            } else {
              if (errorMessage.includes('TooManyEraStakeValues')) {
                errorMessage = t('dappStaking.toast.requiredClaimFirstCompounding', {
                  message: errorMessage,
                });
                resolve(false);
              }
            }

            store.commit('general/setLoading', false, { root: true });
          } else {
            store.commit('general/setLoading', true);
          }
        });
      };

      await signAndSend({
        transaction,
        senderAddress: currentAddress.value,
        substrateAccounts: substrateAccounts.value,
        isCustomSignature: isCustomSig.value,
        txResHandler,
        handleCustomExtrinsic,
        dispatch: store.dispatch,
        tip: selectedTip.value.price,
      });
    } catch (e: any) {
      console.error(e);
      store.dispatch('general/showAlertMsg', {
        msg: e.message,
        alertType: 'error',
      });
    }
  };

  const checkIsClaimable = async () => {
    if (!dapps.value || !currentAddress.value || !era.value) return;
    await Promise.all(
      dapps.value.map(async ({ address }: { address: string }) => {
        const [resIsDappOwner, { numberOfUnclaimedEra, isRequiredWithdraw }] = await Promise.all([
          checkIsDappOwner({
            dappAddress: address,
            api: $api!,
            senderAddress: currentAddress.value,
          }),
          getNumberOfUnclaimedEra({
            dappAddress: address,
            api: $api!,
            senderAddress: currentAddress.value,
            currentEra: era.value,
          }),
        ]);

        if (resIsDappOwner) {
          isDappOwner.value = true;
        }

        if (numberOfUnclaimedEra > 0 || isRequiredWithdraw) {
          isUnclaimedEra.value = true;
        }
      })
    );
  };

  watchEffect(async () => {
    await Promise.all([checkIsClaimable(), getCompoundingType()]);
  });

  return {
    isSupported,
    isCompounding,
    rewardDestination,
    isStaker,
    isDappOwner,
    isUnclaimedEra,
    setRewardDestination,
  };
}
