import { hasExtrinsicFailedEvent } from './../../store/dapp-staking/actions';
import { ISubmittableResult } from '@polkadot/types/types';
import { calculateClaimedStaker } from '../helper/claim';
import { Dispatch } from 'vuex';

export enum TxType {
  dappsStaking = 'dappsStaking',
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
