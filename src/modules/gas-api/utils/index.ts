import axios from 'axios';
import { BN } from '@polkadot/util';
import { ethers } from 'ethers';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { ApiGasNow, GasPrice, GAS_API_URL } from 'src/modules/gas-api';

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

  const numEstimatedGas = await web3.eth.estimateGas(tx);
  const estimatedGas = new BN(numEstimatedGas);
  const data = {
    ...evmGasPrice,
    slow: ethers.utils.formatEther(estimatedGas.mul(new BN(evmGasPrice.slow)).toString()),
    average: ethers.utils.formatEther(estimatedGas.mul(new BN(evmGasPrice.average)).toString()),
    fast: ethers.utils.formatEther(estimatedGas.mul(new BN(evmGasPrice.fast)).toString()),
  };

  return data;
};

export const formatTip = (fee: string): string => {
  const price = ethers.utils.formatEther(fee);
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
    const url = `${GAS_API_URL}/gasnow?network=${network}`;
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
        slow: priorityFeePerGas.slow,
        average: priorityFeePerGas.average,
        fast: priorityFeePerGas.fast,
        baseFeePerGas: data.data.eip1559.baseFeePerGas,
      };
      return {
        evmGasPrice,
        nativeTipPrice,
      };
    } else {
      const { slow, average, fast } = data.data;
      const evmGasPrice = {
        slow: slow,
        average: average,
        fast: fast,
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
      slow: formatTip('10000000000000'),
      average: formatTip('50000000000000'),
      fast: formatTip('5000000000000000'),
    };
    return { evmGasPrice, nativeTipPrice };
  }
};
