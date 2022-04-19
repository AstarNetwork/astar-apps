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

export const mergeTvlArray = ({
  ecosystem,
  dappStaking,
}: {
  ecosystem: number[][];
  dappStaking: number[][];
}): number[][] => {
  const ecosystemReverse = ecosystem.sort((a, b) => b[0] - a[0]);
  const dappStakingReverse = dappStaking.sort((a, b) => b[0] - a[0]);
  const data = dappStakingReverse
    .map((it, i) => {
      if (ecosystemReverse[i]) {
        const ecosystemItem = ecosystemReverse[i];
        return [it[0], it[1] + ecosystemItem[1]];
      } else {
        return it;
      }
    })
    .reverse();

  return data;
};

export const getTvlValue = (tvlArray: number[][]) => {
  const latestTvl = tvlArray[tvlArray.length - 1][1];
  const tvlNum = formatNumber(latestTvl, 1);
  const tvl = `\$${tvlNum}`;
  return tvl;
};

// Note: We filter with the longest duration (1 year) because the array length of the `ecosystem` and `dappStaking` won't be the same in some periods.
// Note: We can fetch the data only once (no need to fetch the data again whenever users select a different duration).

export const getTvlData = async ({
  network,
}: {
  network: string;
}): Promise<{
  mergedTvlData: number[][];
  ecosystemTvlData: number[][];
  dappStakingTvlData: number[][];
  mergedTvlValue: string;
  dappStakingTvlValue: string;
  ecosystemTvlValue: string;
}> => {
  // Original source: DefiLlama API
  const ecosystemTvlUrl = `${TOKEN_API_URL}/v1/${network.toLowerCase()}/token/tvl/1%20year`;
  const dappStakingTvlUrl = `${TOKEN_API_URL}/v1/${network.toLowerCase()}/dapps-staking/tvl/1%20year`;

  const [ecosystem, dappStaking] = await Promise.all([
    axios.get<ChartData>(ecosystemTvlUrl),
    axios.get<[string, number][]>(dappStakingTvlUrl),
  ]);

  const ecosystemTvlData = ecosystem.data.map((it: [number, number]) => [it[0] * 1000, it[1]]);

  const dappStakingTvlData = dappStaking.data.map((it: [string, number]) => [Number(it[0]), it[1]]);

  const mergedTvlData = dappStaking.data.length
    ? mergeTvlArray({
        ecosystem: [...ecosystemTvlData],
        dappStaking: [...dappStakingTvlData],
      })
    : ecosystemTvlData;

  const mergedTvlValue = getTvlValue(mergedTvlData);
  const dappStakingTvlValue = getTvlValue(dappStakingTvlData);
  const ecosystemTvlValue = getTvlValue(ecosystemTvlData);

  return {
    mergedTvlData,
    ecosystemTvlData,
    dappStakingTvlData,
    mergedTvlValue,
    dappStakingTvlValue,
    ecosystemTvlValue,
  };
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
