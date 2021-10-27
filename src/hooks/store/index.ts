import BN from 'bn.js';
import { getUnit } from 'src/hooks/helper/units';
import { reduceDenomToBalance } from 'src/hooks/helper/plasmUtils';

export interface StakeModel {
  address: string;
  amount: number;
  unit: string;
  decimal: number;
}

// TODO refactor since very similar code is in ModalTransferAmount, maybe to move this logic into InputAmount component
export const getAmount = (stakeData: StakeModel): BN => {
  const unit = getUnit(stakeData.unit);
  const amount = reduceDenomToBalance(stakeData.amount, unit, stakeData.decimal);

  return amount;
};
