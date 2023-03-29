// TODO move to common lib
const wait = (ms: number): Promise<number> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export { wait };
