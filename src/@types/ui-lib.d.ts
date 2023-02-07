import { GlobalComponents as UILib } from '@astar-network/astar-ui/dist/packages/export_type';

declare module '@vue/runtime-core' {
  export interface GlobalComponents extends UILib {}
}
