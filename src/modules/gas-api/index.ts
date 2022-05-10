export { getEvmGasPrice } from './utils';

export const GAS_API_URL = 'https://astar-gas-station.herokuapp.com/api';

export interface GasPrice {
  slow: number;
  average: number;
  fast: number;
  baseFeePerGas: number;
}

export interface ApiGasNow {
  code: number;
  data: PriceData;
}

interface PriceData {
  slow: number;
  average: number;
  fast: number;
  timestamp: number;
  eip1559: Eip1559;
}

interface Eip1559 {
  priorityFeePerGas: PriorityFee;
  baseFeePerGas: number;
}

interface PriorityFee {
  slow: number;
  average: number;
  fast: number;
}
