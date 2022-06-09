import { ISubmittableResult } from '@polkadot/types/types';
import { StateInterface } from 'src/store';
import { Store } from 'vuex';
import { calculateClaimedStaker } from '../helper/claim';
import { hasExtrinsicFailedEvent } from './../../store/dapp-staking/actions';

export enum TxType {
  dappsStaking = 'dappsStaking',
  requiredClaim = 'requiredClaim',
}

export const displayCustomMessage = ({
  txType,
  store,
  result,
  senderAddress,
  t,
}: {
  txType: TxType;
  store: Store<StateInterface>;
  result: ISubmittableResult;
  senderAddress: string;
  t: (...arg: any) => void;
}): void => {
  if (txType === TxType.dappsStaking) {
    dispatchClaimMessage({
      result,
      store,
      senderAddress,
      t,
    });
  } else if (txType === TxType.requiredClaim) {
    dispatchRequiredClaimMessage({
      result,
      store,
      t,
    });
  }
};

const dispatchClaimMessage = ({
  store,
  result,
  senderAddress,
  t,
}: {
  store: Store<StateInterface>;
  result: ISubmittableResult;
  senderAddress: string;
  t: (...arg: any) => void;
}): void => {
  if (result.status.isFinalized) {
    if (!hasExtrinsicFailedEvent(result.events, store.dispatch)) {
      const totalClaimedStaker = calculateClaimedStaker({
        events: result.events,
        senderAddress,
      });

      // Memo: users invoked withdraw transaction from unregistered dapps
      if (totalClaimedStaker.claimedAmount === 0) {
        return;
      }

      store.commit('dapps/setClaimedRewardsAmount', totalClaimedStaker.claimedAmount);

      const msg = t('dappStaking.toast.successfullyClaimed', {
        amount: totalClaimedStaker.formattedAmount,
      });
      store.dispatch(
        'general/showAlertMsg',
        {
          msg,
          alertType: 'success',
        },
        { root: true }
      );
    }
  }
};

const dispatchRequiredClaimMessage = ({
  store,
  result,
  t,
}: {
  store: Store<StateInterface>;
  result: ISubmittableResult;
  t: (...arg: any) => void;
}): void => {
  if (result.status.isFinalized) {
    let errorMessage = '';
    const res = hasExtrinsicFailedEvent(
      result.events,
      store.dispatch,
      (message: string) => (errorMessage = message)
    );
    if (res) {
      if (errorMessage.includes('TooManyEraStakeValues')) {
        const msg = t('dappStaking.toast.requiredClaimFirst');

        store.dispatch(
          'general/showAlertMsg',
          {
            msg,
            alertType: 'error',
          },
          { root: true }
        );
      }
    }
  }
};
