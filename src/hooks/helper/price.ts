import axios from 'axios';

export const getUsdBySymbol = async (symbol: string): Promise<number> => {
  const url = 'https://api.coingecko.com/api/v3/coins/list';
  const { data } = await axios.get<{ id: string; symbol: string }[]>(url);
  const item = data.find((it) => it.symbol.toLowerCase() === symbol.toLowerCase());
  if (!item) return 0;
  return (await getUsdPrice(item.id)) ?? 0;
};

export const getUsdPrice = async (currency: string): Promise<number> => {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${currency}&vs_currencies=usd`;
  const result = await axios.get(url);
  const price = result.data[currency].usd;

  return Number(price);
};

export const numFormatter = (num: number): string => {
  if (num > 999 && num < 1000000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  if (num > 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }

  return String(num);
};

export const calUsdAmount = async ({
  symbol,
  amount,
}: {
  symbol: string;
  amount: number;
}): Promise<number> => {
  const price = await getUsdBySymbol(symbol);
  const total = price * amount;
  return Number(total.toFixed(2));
};
