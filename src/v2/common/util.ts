// TODO move to common lib
const wait = (ms: number): Promise<number> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const abs = (number: bigint): bigint => (number >= 0 ? number : number * BigInt(-1));

const min = (a: bigint, b: bigint): bigint => (a < b ? a : b);

const max = (a: bigint, b: bigint): bigint => (a > b ? a : b);

const getDomain = (url: string | undefined): string | undefined => {
  if (!url) {
    return undefined;
  }

  const prefix = /^https?:\/\//i;
  const domain = /^[^\/:]+/;
  // Remove any prefix
  url = url.replace(prefix, '');
  // Extract just the domain
  const match = url.match(domain);
  if (match) {
    return match[0];
  }

  return undefined;
};

export { wait, abs, min, max, getDomain };
