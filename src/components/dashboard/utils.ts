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
    { value: 1e9, symbol: 'G' },
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
