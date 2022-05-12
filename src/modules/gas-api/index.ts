export { fetchEvmGasPrice, getEvmGas, getEvmGasCost } from './utils';

export const GAS_API_URL = 'https://astar-gas-station.herokuapp.com/api';

export const sampleEvmWalletAddress = '0xc9ec54736DD2A2ef6A56AB0330bb04E1aCA43472';

export interface GasPrice {
  slow: string;
  average: string;
  fast: string;
  baseFeePerGas?: string;
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

export type Speed = 'slow' | 'average' | 'fast';

export interface SelectedGas {
  speed: Speed;
  price: string;
}
