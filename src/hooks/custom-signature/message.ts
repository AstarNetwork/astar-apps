import { ISubmittableResult } from '@polkadot/types/types';
import { StateInterface } from 'src/store';
import { Store } from 'vuex';
import { calculateClaimedStaker } from '../helper/claim';
import { hasExtrinsicFailedEvent } from './../../store/dapp-staking/actions';

export enum TxType {
  dappsStaking = 'dappsStaking',
}

export const displayCustomMessage = ({
  txType,
  store,
  result,
  senderAddress,
}: {
  txType: TxType;
  store: Store<StateInterface>;
  result: ISubmittableResult;
  senderAddress: string;
}): void => {
  if (txType === TxType.dappsStaking) {
    dispatchClaimMessage({
      result,
      store,
      senderAddress,
    });
  }
};

const dispatchClaimMessage = ({
  store,
  result,
  senderAddress,
}: {
  store: Store<StateInterface>;
  result: ISubmittableResult;
  senderAddress: string;
}): void => {
  if (result.status.isFinalized) {
    if (!hasExtrinsicFailedEvent(result.events, store.dispatch)) {
      const totalClaimedStaker = calculateClaimedStaker({
        events: result.events,
        senderAddress,
      });
      store.commit('dapps/setClaimedRewardsAmount', totalClaimedStaker.claimedAmount);

      const msg = `Successfully claimed ${totalClaimedStaker.formattedAmount}`;
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
