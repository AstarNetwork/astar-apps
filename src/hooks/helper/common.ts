export const objToArray = (obj: any): any[] => {
  const keys = Object.keys(obj);
  const array = keys.map((k) => obj[k]);
  return array;
};

export const checkIsNullOrUndefined = (value: any) => {
  return value === null || value === undefined;
};
