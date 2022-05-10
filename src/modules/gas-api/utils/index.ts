import axios from 'axios';
import { GAS_API_URL, ApiGasNow, GasPrice } from './../index';

export const getEvmGasPrice = async ({
  network,
  isEip1559,
}: {
  network: string;
  isEip1559: boolean;
}): Promise<GasPrice> => {
  const url = `${GAS_API_URL}/${network}/gasnow`;
  const { data } = await axios.get<ApiGasNow>(url);
  if (!data || data.code !== 200) {
    throw Error('something went wrong');
  }

  if (isEip1559) {
    const { slow, average, fast } = data.data.eip1559.priorityFeePerGas;
    return {
      slow,
      average,
      fast,
      baseFeePerGas: data.data.eip1559.baseFeePerGas,
    };
  } else {
    const { slow, average, fast } = data.data;
    return {
      slow,
      average,
      fast,
      baseFeePerGas: 0,
    };
  }
};
