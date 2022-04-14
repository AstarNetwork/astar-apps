import { ChartData } from './../../../components/dashboard/ChartData';
import axios from 'axios';
import { Duration, TOKEN_API_URL } from '../index';

/**
 * Formats number and adds weight prefix e.g. 10000 formats to 10k
 * @param value Value to format
 * @param digits Number of decimal places
 * @returns Formated number
 */
export const formatNumber = (value: number, digits: number): string => {
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'B' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return value >= item.value;
    });

  return item ? (value / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0';
};

const mergeTvlArray = ({
  ecosystem,
  dappStaking,
}: {
  ecosystem: [number, number][];
  dappStaking: [string, number][];
}): number[][] => {
  const data = dappStaking
    .map((it, i) => {
      const timestamp = Number(it[0]);
      if (ecosystem[i]) {
        const ecosystemItem = ecosystem[i];
        return [timestamp, it[1] + ecosystemItem[1]];
      } else {
        return [timestamp, it[1]];
      }
    })
    .reverse();

  return data;
};

// Note: We filter with the longest duration (1 year) because the array length of the `ecosystem` and `dappStaking` won't be the same in some periods.
// Note: We can fetch the data only once (no need to fetch the data again whenever users select a different duration).
export const getTvlData = async ({
  network,
}: {
  network: string;
}): Promise<{ mergedData: number[][]; tvl: string }> => {
  // Original source: DefiLlama API
  const ecosystemTvlUrl = `${TOKEN_API_URL}/v1/${network.toLowerCase()}/token/tvl/1%20year`;
  const dappStakingTvlUrl = `${TOKEN_API_URL}/v1/${network.toLowerCase()}/dapps-staking/tvl/1%20year`;

  const [ecosystem, dappStaking] = await Promise.all([
    axios.get<ChartData>(ecosystemTvlUrl),
    axios.get<[string, number][]>(dappStakingTvlUrl),
  ]);

  const mergedData = mergeTvlArray({
    ecosystem: ecosystem.data.reverse(),
    dappStaking: dappStaking.data.reverse(),
  });

  const tvl = `\$${formatNumber(mergedData[mergedData.length - 1][1], 1)}`;

  return { mergedData, tvl };
};

export const filterTvlData = ({
  mergedArray,
  duration,
}: {
  mergedArray: number[][];
  duration: Duration;
}) => {
  switch (duration) {
    case '7 days':
      return mergedArray.slice(-7);
    case '30 days':
      return mergedArray.slice(-30);
    case '90 days':
      return mergedArray.slice(-90);
    case '1 year':
      return mergedArray.slice(-365);

    default:
      return mergedArray.slice(-7);
  }
};
