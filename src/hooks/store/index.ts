import BN from 'bn.js';
import { getUnit } from 'src/hooks/helper/units';
import { reduceDenomToBalance } from 'src/hooks/helper/plasmUtils';
import { useChainMetadata } from 'src/hooks';

export interface StakeModel {
  address: string;
  amount: number;
  unit: string;
  decimal: number;
}

export const getAmount = (amount: number, unit: string): BN => {
  const unitIndex = getUnit(unit);
  const { decimal } = useChainMetadata();
  return reduceDenomToBalance(amount, unitIndex, decimal.value);
};
