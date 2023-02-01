import { GlobalComponents as UILib } from '@astar-network/astar-ui';

declare module '@vue/runtime-core' {
  export interface GlobalComponents extends UILib {}
}
