import { TOKEN_API_URL } from 'src/modules/token-api';
import axios from 'axios';

export const getUsdBySymbol = async (symbol: string): Promise<number> => {
  try {
    const url = TOKEN_API_URL + '/v1/token/price/' + symbol;
    const { data } = await axios.get<number>(url);
    return data;
  } catch (error) {
    console.error(error);
    return 0;
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
