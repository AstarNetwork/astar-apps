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

/**
 * Convert number to K M G
 * @param num -> '1903'
 * @returns '1.903K'
 */
export const nFormatter = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 3,
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
};
