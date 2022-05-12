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

export const fetchEvmGasPrice = async ({
  network,
  isEip1559,
  web3,
}: {
  network: string;
  isEip1559: boolean;
  web3: Web3;
}): Promise<GasPrice> => {
  try {
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
  } catch (error) {
    console.error(error);
    const fallbackGasPrice = Number(await web3.eth.getGasPrice());
    return {
      slow: fallbackGasPrice,
      average: Math.floor(fallbackGasPrice * 1.1),
      fast: Math.floor(fallbackGasPrice * 1.3),
      baseFeePerGas: 0,
    };
  }
};
