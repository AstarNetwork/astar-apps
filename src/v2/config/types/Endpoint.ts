import { Class } from './TypeMapping';

export type Endpoint = {
  networkAlias: string;
  displayName: string;
  endpoint: string;
  repository: Class;
  parachainId?: number;
};
