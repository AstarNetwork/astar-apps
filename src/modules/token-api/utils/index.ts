import { ChartData } from 'src/components/dashboard/ChartData';
import axios from 'axios';
import { Duration, TOKEN_API_URL, TransferDetail, StatsDetail, StatsType } from '../index';

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
  base,
}: {
  ecosystem: number[][];
  dappStaking: number[][];
  base: 'dappStaking' | 'ecosystem';
}): number[][] => {
  const isBaseDappStaking = base === 'dappStaking';

  const ecosystemReverse = ecosystem.sort((a, b) => b[0] - a[0]);
  const dappStakingReverse = dappStaking.sort((a, b) => b[0] - a[0]);
  const data = isBaseDappStaking
    ? dappStakingReverse
        .map((it, i) => {
          if (ecosystemReverse[i]) {
            const ecosystemItem = ecosystemReverse[i];
            return [it[0], it[1] + ecosystemItem[1]];
          } else {
            return it;
          }
        })
        .reverse()
    : ecosystemReverse
        .map((it, i) => {
          if (dappStakingReverse[i]) {
            const dappStakingItem = dappStakingReverse[i];
            return [it[0], it[1] + dappStakingItem[1]];
          } else {
            return it;
          }
        })
        .reverse();

  return data;
};

export const getTvlValue = (tvlArray: number[][]) => {
  const latestTvl = tvlArray.length ? tvlArray[tvlArray.length - 1][1] : 0;
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
  if (!network) throw Error('Invalid network');
  // Original source: DefiLlama API
  const ecosystemTvlUrl = `${TOKEN_API_URL}/v1/${network}/token/tvl/1%20year`;
  const dappStakingTvlUrl = `${TOKEN_API_URL}/v1/${network}/dapps-staking/tvl/1%20year`;

  const [ecosystem, dappStaking] = await Promise.all([
    axios.get<ChartData>(ecosystemTvlUrl),
    axios.get<[string, number][]>(dappStakingTvlUrl),
  ]);

  const ecosystemTvlData = ecosystem.data.map((it: [number, number]) => [it[0] * 1000, it[1]]);

  const dappStakingTvlData = dappStaking.data.length
    ? dappStaking.data.map((it: [string, number]) => [Number(it[0]), it[1]])
    : [];

  const mergedTvlData = dappStaking.data.length
    ? mergeTvlArray({
        ecosystem: [...ecosystemTvlData],
        dappStaking: [...dappStakingTvlData],
        base: 'dappStaking',
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

export const filterTvlData = ({ data, duration }: { data: number[][]; duration: Duration }) => {
  switch (duration) {
    case '7 days':
      return data.slice(-7);
    case '30 days':
      return data.slice(-30);
    case '90 days':
      return data.slice(-90);
    case '1 year':
      return data.slice(-365);

    default:
      return data.slice(-7);
  }
};

export const castDurationToDaysNumber = (duration: Duration): number => {
  switch (duration) {
    case '7 days':
      return 7;
    case '30 days':
      return 30;
    case '90 days':
      return 90;
    case '1 year':
      return 365;
    default:
      return 365;
  }
};

export const getClaimedAmount = async ({
  network,
  account,
}: {
  network: string;
  account: string;
}): Promise<number> => {
  const url = `${TOKEN_API_URL}/v1/${network}/dapps-staking/earned/${account}`;
  const result = await axios.get<number>(url);
  return Number(result.data.toFixed(0));
};

export const fetchTransferDetails = async ({
  hash,
  network,
}: {
  hash: string;
  network: string;
}): Promise<TransferDetail> => {
  const url = `${TOKEN_API_URL}/v1/${network}/tx/transfer?hash=${hash}`;
  const result = await axios.get<TransferDetail>(url);
  return result.data;
};

export const fetchDappsStats = async ({
  dapp,
  network,
}: {
  dapp: string;
  network: string;
}): Promise<StatsDetail[]> => {
  const url = `${TOKEN_API_URL}/v1/${network}/dapps-staking/stats/dapp/${dapp}`;
  const result = await axios.get<StatsDetail[]>(url);
  return result.data;
};

export const filterStatsData = ({
  data,
  currentFilter,
  property,
}: {
  data: StatsDetail[];
  currentFilter: Duration;
  property: StatsType;
}): number[][] => {
  const filteredResult = data.filter(
    (it) => Number(it.numberOfCalls) !== 0 && Number(it[property]) !== 0
  );
  const oneDayMilli = 3600000 * 24;
  return filteredResult
    .map((it) => [Number(it.timestamp) * 1000, Number(it[property])])
    .filter((it) => {
      const latestTs = Number(filteredResult[filteredResult.length - 1].timestamp) * 1000;
      const cutoff = latestTs - oneDayMilli * castDurationToDaysNumber(currentFilter);
      return it[0] > cutoff;
    });
};
