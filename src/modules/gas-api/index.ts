export { fetchEvmGasPrice, getEvmGas, getEvmGasCost } from 'src/modules/gas-api/utils';

export const GAS_API_URL = 'https://gas.astar.network/api';

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
  slow: string;
  average: string;
  fast: string;
  timestamp: number;
  eip1559: Eip1559;
  tip: Fee;
}

interface Eip1559 {
  priorityFeePerGas: Fee;
  baseFeePerGas: string;
}

interface Fee {
  slow: string;
  average: string;
  fast: string;
}

export type Speed = 'slow' | 'average' | 'fast';

export interface SelectedGas {
  speed: Speed;
  price: string;
}

export interface GasTip {
  evmGasPrice: GasPrice;
  nativeTipPrice: GasPrice;
}
