// TODO move to common lib
const wait = (ms: number): Promise<number> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const abs = (number: bigint): bigint => (number >= 0 ? number : number * BigInt(-1));

const min = (a: bigint, b: bigint): bigint => (a < b ? a : b);

const max = (a: bigint, b: bigint): bigint => (a > b ? a : b);

export { wait, abs, min, max };
