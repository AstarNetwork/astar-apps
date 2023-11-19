// TODO move to common lib
const wait = (ms: number): Promise<number> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const abs = (number: bigint): bigint => (number >= 0 ? number : number * BigInt(-1));

export { wait, abs };
