export const reverseObject = (obj: { [key: string]: string }): { [key: string]: string } => {
  const reversedObj: { [key: string]: string } = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      reversedObj[obj[key]] = key;
    }
  }
  return reversedObj;
};
