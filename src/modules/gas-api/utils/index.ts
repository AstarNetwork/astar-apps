import axios from 'axios';
import { ethers } from 'ethers';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { ApiGasNow, GasPrice, GAS_API_URL } from './../index';

export const getEvmGas = async (web3: Web3, selectedGasPrice: string) => {
  const gasPriceFallback = await web3.eth.getGasPrice();
  const gasPrice = selectedGasPrice !== '0' ? selectedGasPrice : gasPriceFallback;
  return gasPrice;
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
    slow: ethers.utils.formatEther(estimatedGas * Number(evmGasPrice.slow)),
    average: ethers.utils.formatEther(estimatedGas * Number(evmGasPrice.average)),
    fast: ethers.utils.formatEther(estimatedGas * Number(evmGasPrice.fast)),
  };

  return data;
};

// Ref: https://stakesg.slack.com/archives/C028YNW1PED/p1652346083299849?thread_ts=1652338487.358459&cid=C028YNW1PED
export const formatTip = (fee: number): string => {
  const price = ethers.utils.formatEther(String(fee));
  // Memo: throw an error whenever provided price is too way expensive
  if (Number(price) > 1) {
    throw Error('Calculated tip amount is more than 1 ASTR/SDN');
  }
  return price;
};

export const fetchEvmGasPrice = async ({
  network,
  isEip1559,
  web3,
}: {
  network: string;
  isEip1559: boolean;
  web3: Web3;
}): Promise<{ evmGasPrice: GasPrice; nativeTipPrice: GasPrice }> => {
  try {
    const url = `${GAS_API_URL}/${network}/gasnow`;
    const { data } = await axios.get<ApiGasNow>(url);
    if (!data || data.code !== 200) {
      throw Error('something went wrong');
    }
    const { tip } = data.data;
    const { priorityFeePerGas } = data.data.eip1559;
    const nativeTipPrice = {
      slow: formatTip(tip.slow),
      average: formatTip(tip.average),
      fast: formatTip(tip.fast),
    };

    if (isEip1559) {
      const evmGasPrice = {
        slow: String(priorityFeePerGas.slow),
        average: String(priorityFeePerGas.average),
        fast: String(priorityFeePerGas.fast),
        baseFeePerGas: String(data.data.eip1559.baseFeePerGas),
      };
      return {
        evmGasPrice,
        nativeTipPrice,
      };
    } else {
      const { slow, average, fast } = data.data;
      const evmGasPrice = {
        slow: String(slow),
        average: String(average),
        fast: String(fast),
        baseFeePerGas: '0',
      };
      return {
        evmGasPrice,
        nativeTipPrice,
      };
    }
  } catch (error) {
    console.error(error);
    const fallbackGasPrice = Number(
      await web3.eth.getGasPrice().catch(() => {
        const oneGwei = '1000000000';
        return oneGwei;
      })
    );

    //Rate: https://stakesg.slack.com/archives/C028YNW1PED/p1652343972144359?thread_ts=1652338487.358459&cid=C028YNW1PED
    const slow = fallbackGasPrice;
    const average = Math.floor(fallbackGasPrice * 9);
    const fast = Math.floor(fallbackGasPrice * 56);
    const evmGasPrice = {
      slow: String(slow),
      average: String(average),
      fast: String(fast),
      baseFeePerGas: '0',
    };
    const nativeTipPrice = {
      slow: formatTip(10000000000000),
      average: formatTip(50000000000000),
      fast: formatTip(5000000000000000),
    };
    return { evmGasPrice, nativeTipPrice };
  }
};
