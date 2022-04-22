import { formatNumber } from './../utils';

export const textChart = {
  tvl: {
    title: 'dashboard.chart.tvl.title',
    tooltip: 'dashboard.chart.tvl.tooltip',
  },
  dappStaking: {
    title: 'dashboard.chart.dappStaking.title',
    tooltip: 'dashboard.chart.dappStaking.tooltip',
  },
  ecosystem: {
    title: 'dashboard.chart.ecosystem.title',
    tooltip: 'dashboard.chart.ecosystem.tooltip',
  },
  ttlTransactions: {
    title: 'dashboard.chart.ttlTransactions.title',
    tooltip: 'dashboard.chart.ttlTransactions.tooltip',
  },
  tokenPrice: {
    title: 'dashboard.chart.tokenPrice.title',
    tooltip: 'dashboard.chart.tokenPrice.tooltip',
  },
};

export const titleFormatter = (title: string, data: any) => {
  const prefix = title === textChart.ttlTransactions.title ? '' : '$';
  if (data.value > 999) {
    return prefix + formatNumber(data.value, 1);
  }
  return prefix + data.value;
};

export const valueDecimalsFormatter = (title: string) => {
  return title === textChart.tokenPrice.title ? 4 : 0;
};

export const seriesFormatter = ({
  isMultipleLine,
  tooltip,
  data,
  mergedData,
  textTvl,
}: {
  isMultipleLine: boolean;
  tooltip: string;
  data: number[][] | null;
  mergedData: number[][] | null;
  textTvl: string;
}) => {
  if (isMultipleLine) {
    return [
      {
        name: textTvl,
        type: 'area',
        color: '#0085FF',
        data: mergedData,
        fillColor: 'transparent',
        lineWidth: '1px',
      },
      {
        name: tooltip,
        type: 'area',
        data: data,
        color: '#05b6fd',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(7, 200, 254, 0.5)'],
            [0.1, 'rgba(7, 200, 254, 0.4)'],
            [0.3, 'rgba(7, 200, 254, 0.2)'],
            [0.5, 'rgba(7, 200, 254, 0.1)'],
            [0.8, 'rgba(7, 200, 254, 0.05)'],
            [1, 'rgba(7, 200, 254, 0)'],
          ],
        },
        lineWidth: '2px',
      },
    ];
  } else {
    return [
      {
        name: tooltip,
        type: 'area',
        data: data,
        color: '#0085FF',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(0, 133, 255, 0.5)'],
            [0.1, 'rgba(0, 133, 255, 0.4)'],
            [0.3, 'rgba(0, 133, 255, 0.2)'],
            [0.5, 'rgba(0, 133, 255, 0.1)'],
            [0.8, 'rgba(0, 133, 255, 0.05)'],
            [1, 'rgba(0, 133, 255, 0)'],
          ],
        },
        lineWidth: '2px',
      },
    ];
  }
};
