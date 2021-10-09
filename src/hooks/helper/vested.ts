import BN from 'bn.js';

export const getVested = ({
  currentBlock,
  startBlock,
  perBlock,
}: {
  currentBlock: BN;
  startBlock: BN;
  perBlock: BN;
}) => {
  const blockHasPast = currentBlock.sub(startBlock);
  const vested = blockHasPast.mul(perBlock);
  return vested;
};
