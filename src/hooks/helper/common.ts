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

// Memo: scrollBehavior in createRouter is not working
export const scrollTo = (id: string): void => {
  const el = document.getElementById(id);
  el && el.scrollIntoView({ behavior: 'auto' });
};

// Ref: https://stackabuse.com/get-query-string-values-in-javascript/
export const getQueryParams = (): any => {
  const url = window.location.href;
  const paramArr = url.slice(url.indexOf('?') + 1).split('&');
  const params = {};
  paramArr.map((param) => {
    const [key, val] = param.split('=');
    // @ts-ignore
    params[key] = decodeURIComponent(val);
  });
  return params;
};
