// TODO move to common lib
const wait = (ms: number): Promise<number> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const abs = (number: bigint): bigint => (number >= 0 ? number : number * BigInt(-1));

const min = (a: bigint, b: bigint): bigint => (a < b ? a : b);

const max = (a: bigint, b: bigint): bigint => (a > b ? a : b);

const sort = (a: bigint, b: bigint): number => {
  if (a < b) {
    return 1;
  } else if (a > b) {
    return -1;
  } else {
    return 0;
  }
};

export { wait, abs, min, max, sort };
