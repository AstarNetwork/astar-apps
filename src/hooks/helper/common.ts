export const objToArray = (obj: any): any[] => {
  const keys = Object.keys(obj);
  const array = keys.map((k) => obj[k]);
  return array;
};

export const checkIsNullOrUndefined = (value: any) => {
  return value === null || value === undefined;
};

export const capitalize = (str: string): string => {
  if (typeof str !== 'string' || !str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getRandomFromArray = (list: any[]) => {
  return list[Math.floor(Math.random() * list.length)];
};

//Ref: https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Ref: https://stackoverflow.com/questions/4912788/truncate-not-round-off-decimal-numbers-in-javascript
export const truncate = (num: number | string, places = 3) => {
  const formattedNum = Number(num);
  return Math.trunc(formattedNum * Math.pow(10, places)) / Math.pow(10, places);
};
