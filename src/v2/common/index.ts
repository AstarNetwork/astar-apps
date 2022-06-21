import { setContainer } from './container';

export * from './Guard';
export * from './util';
export * from './container';

export const container = setContainer({ skipBaseClassChecks: true });
