import { hasExtrinsicFailedEvent } from './../../store/dapp-staking/actions';
import { ISubmittableResult } from '@polkadot/types/types';
import { calculateClaimedStaker } from '../helper/claim';
import { Dispatch } from 'vuex';

export enum TxType {
  dappsStaking = 'dappsStaking',
  requiredClaim = 'requiredClaim',
}

export const displayCustomMessage = ({
  txType,
  dispatch,
  result,
  senderAddress,
}: {
  txType: TxType;
  dispatch: Dispatch;
  result: ISubmittableResult;
  senderAddress: string;
}): void => {
  if (txType === TxType.dappsStaking) {
    dispatchClaimMessage({
      result,
      dispatch,
      senderAddress,
    });
  } else if (txType === TxType.requiredClaim) {
    dispatchRequiredClaimMessage({
      result,
      dispatch,
    });
  }
};

const dispatchClaimMessage = ({
  dispatch,
  result,
  senderAddress,
}: {
  dispatch: Dispatch;
  result: ISubmittableResult;
  senderAddress: string;
}): void => {
  if (result.status.isFinalized) {
    if (!hasExtrinsicFailedEvent(result.events, dispatch)) {
      const totalClaimedStaker = calculateClaimedStaker({
        events: result.events,
        senderAddress,
      });
      const msg = `Successfully claimed ${totalClaimedStaker}`;
      dispatch(
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
  dispatch,
  result,
}: {
  dispatch: Dispatch;
  result: ISubmittableResult;
}): void => {
  if (result.status.isFinalized) {
    let errorMessage = '';
    const res = hasExtrinsicFailedEvent(
      result.events,
      dispatch,
      (message: string) => (errorMessage = message)
    );
    if (res) {
      if (errorMessage.includes('TooManyEraStakeValues')) {
        const msg = 'Please claim your rewards before sending transaction';
        dispatch(
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
