// it's varient based on decimal from network metadata
export const defaultUnitIndex = 5;
const arrUnitPrefixes = [-15, -12, -9, -6, -3, 0, 3, 6, 9, 12];
const arrUnitNames = [
  'femto',
  'pico',
  'nano',
  'micro',
  'milli',
  'default',
  'Kilo',
  'Mill',
  'Bill',
  'Tril',
];

export const setDefaultUnitName = (defaultName: string) => {
  arrUnitNames[defaultUnitIndex] = defaultName;
};

export const getUnitNames = () => {
  return arrUnitNames;
};

export const getUnit = (unitType: string) => {
  const index = arrUnitNames.findIndex((elem) => elem === unitType);
  return arrUnitPrefixes[index];
};

export const nFormatter = (num: number): string => {
  if (num >= 1000000000) {
    return (
      Number((num / 1000000000).toFixed(3))
        .toString()
        .replace(/\.0$/, '') + 'G'
    );
  }
  if (num >= 1000000) {
    return (
      Number((num / 1000000).toFixed(3))
        .toString()
        .replace(/\.0$/, '') + 'M'
    );
  }
  if (num >= 1000) {
    return (
      Number((num / 1000).toFixed(3))
        .toString()
        .replace(/\.0$/, '') + 'K'
    );
  }
  return Number(num.toFixed(3)).toString();
};
