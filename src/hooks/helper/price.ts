import { wrappedTokenMap } from './../../modules/token/index';
import axios from 'axios';

const getUsdPriceViaDia = async (symbol: string): Promise<number> => {
  try {
    // Ref: https://docs.diadata.org/documentation/api-1/api-endpoints#quotation
    const url = `https://api.diadata.org/v1/quotation/${symbol.toUpperCase()}`;
    const result = await axios.get(url);
    const price = result.data.Price;
    return price;
  } catch (error) {
    return getUsdBySymbolViaCoingecko(symbol);
  }
};

export const getUsdBySymbolViaCoingecko = async (symbol: string): Promise<number> => {
  try {
    const url = 'https://api.coingecko.com/api/v3/coins/list';
    const { data } = await axios.get<{ id: string; symbol: string }[]>(url);
    const item = data.find((it) => it.symbol.toLowerCase() === symbol.toLowerCase());
    if (!item) return 0;
    return await getUsdPrice(item.id);
  } catch (error) {
    console.error(error);
    console.error(`symbol: ${symbol}`);
    return 0;
  }
};

export const getUsdBySymbol = async (symbol: string): Promise<number> => {
  let tokenSymbol = symbol;
  if (wrappedTokenMap.hasOwnProperty(symbol)) {
    tokenSymbol = wrappedTokenMap[symbol as keyof typeof wrappedTokenMap];
  }
  try {
    return getUsdPriceViaDia(tokenSymbol);
  } catch (error) {
    console.error(error);
    try {
      return getUsdBySymbolViaCoingecko(tokenSymbol);
    } catch (error) {
      console.error(error);
      console.error(`symbol: ${symbol}`);
      return 0;
    }
  }
};

export const getUsdPrice = async (currency: string): Promise<number> => {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${currency}&vs_currencies=usd`;
    const result = await axios.get(url);
    const price = result.data[currency].usd;
    return Number(price);
  } catch (error) {
    console.error(error);
    console.error(`currency: ${currency}`);
    return getUsdPriceViaDia(currency);
  }
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
