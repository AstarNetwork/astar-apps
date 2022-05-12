import { ASTAR_DECIMALS } from './../../../hooks/helper/plasmUtils';
import { TransactionConfig } from 'web3-eth';
import axios from 'axios';
import Web3 from 'web3';
import { GAS_API_URL, ApiGasNow, GasPrice } from './../index';
import { ethers } from 'ethers';

export const getEvmGas = async (web3: Web3, selectedGasPrice: number) => {
  const gasPriceFallback = await web3.eth.getGasPrice();
  const gasPrice = selectedGasPrice > 0 ? selectedGasPrice : gasPriceFallback;
  return String(gasPrice);
};

export const getEvmGasCost = async ({
  isNativeToken,
  evmGasPrice,
  fromAddress,
  toAddress,
  web3,
  value,
  encodedData,
}: {
  isNativeToken: boolean;
  evmGasPrice: GasPrice;
  fromAddress: string;
  web3: Web3;
  toAddress: string;
  value: string;
  encodedData?: string;
}): Promise<GasPrice> => {
  const tx: TransactionConfig = isNativeToken
    ? {
        from: fromAddress,
        to: toAddress,
        // value: web3.utils.toWei(value, 'ether'),
        value: ethers.utils.parseEther(value).toString(),
      }
    : {
        nonce: await web3.eth.getTransactionCount(fromAddress),
        from: fromAddress,
        to: toAddress,
        value,
        data: encodedData,
      };

  const estimatedGas = await web3.eth.estimateGas(tx);
  const data = {
    ...evmGasPrice,
    slow: Number(ethers.utils.formatEther(estimatedGas * evmGasPrice.slow)),
    average: Number(ethers.utils.formatEther(estimatedGas * evmGasPrice.average)),
    fast: Number(ethers.utils.formatEther(estimatedGas * evmGasPrice.fast)),
  };

  return data;
};

// Ref: https://stakesg.slack.com/archives/C028YNW1PED/p1652346083299849?thread_ts=1652338487.358459&cid=C028YNW1PED
export const priorityFeeToTips = (fee: number) => {
  const rate = 0.000000000000001;
  return Number((fee * rate).toFixed(ASTAR_DECIMALS));
};

export const fetchEvmGasPrice = async ({
  network,
  isEip1559,
  web3,
}: {
  network: string;
  isEip1559: boolean;
  web3: Web3;
}): Promise<{ evmGasPrice: GasPrice; nativeTipsPrice: GasPrice }> => {
  try {
    const url = `${GAS_API_URL}/${network}/gasnow`;
    const { data } = await axios.get<ApiGasNow>(url);
    if (!data || data.code !== 200) {
      throw Error('something went wrong');
    }
    const { priorityFeePerGas } = data.data.eip1559;
    const nativeTipsPrice = {
      slow: priorityFeeToTips(priorityFeePerGas.slow),
      average: priorityFeeToTips(priorityFeePerGas.average),
      fast: priorityFeeToTips(priorityFeePerGas.fast),
    };

    if (isEip1559) {
      const evmGasPrice = {
        slow: priorityFeePerGas.slow,
        average: priorityFeePerGas.average,
        fast: priorityFeePerGas.fast,
        baseFeePerGas: data.data.eip1559.baseFeePerGas,
      };
      return {
        evmGasPrice,
        nativeTipsPrice,
      };
    } else {
      const { slow, average, fast } = data.data;
      const evmGasPrice = {
        slow,
        average,
        fast,
        baseFeePerGas: 0,
      };
      return {
        evmGasPrice,
        nativeTipsPrice,
      };
    }
  } catch (error) {
    console.error(error);
    const fallbackGasPrice = Number(await web3.eth.getGasPrice());
    const evmGasPrice = {
      slow: fallbackGasPrice,
      average: Math.floor(fallbackGasPrice * 1.1),
      fast: Math.floor(fallbackGasPrice * 1.3),
      baseFeePerGas: 0,
    };
    const nativeTipsPrice = {
      slow: 1,
      average: 5,
      fast: 10,
    };
    return { evmGasPrice, nativeTipsPrice };
  }
};
