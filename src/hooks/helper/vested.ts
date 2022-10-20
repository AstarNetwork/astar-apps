import { BN } from '@polkadot/util';

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
    return new BN(0);
  }

  const blockHasPast = currentBlock.sub(startBlock);
  const vested = BN.min(locked, blockHasPast.mul(perBlock));
  return vested;
};
