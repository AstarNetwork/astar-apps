import { Balance } from '@polkadot/types/interfaces';
import BN from 'bn.js';

export const getVested = ({
  currentBlock,
  startBlock,
  perBlock,
  locked,
}: {
  currentBlock: BN;
  startBlock: BN;
  perBlock: BN;
  locked: BN;
}) => {
  if (currentBlock.lt(startBlock)) {
    return <Balance>new BN(0);
  }

  const blockHasPast = currentBlock.sub(startBlock);
  const vested = <Balance>BN.min(locked, blockHasPast.mul(perBlock));
  return vested;
};
