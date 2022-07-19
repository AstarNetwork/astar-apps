export type Class = {
  new (...args: unknown[]): unknown;
};

export type TypeMapping = {
  [key: string]: Class;
};

export type TokenId = {
  [key: string]: number;
};
