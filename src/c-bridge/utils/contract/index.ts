import { MaxUint256 } from '@ethersproject/constants';
import { ethers } from 'ethers';
import ABI from 'src/c-bridge/abi/ERC20.json';
import { BridgeMethod, SelectedToken } from 'src/c-bridge';
import CANONICAL_BURN_ABI from 'src/c-bridge/abi/canonical-burn.json';
import CANONICAL_DEPOSIT_ABI from 'src/c-bridge/abi/canonical-deposit.json';
import POOL_ABI from 'src/c-bridge/abi/pool.json';
import { buildWeb3Instance, nativeCurrency } from 'src/web3';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { getTokenInfo } from '../index';
import { EvmChain } from './../../index';

export const getMinAndMaxAmount = async ({
  srcChainId,
  selectedToken,
}: {
  selectedToken: SelectedToken;
  srcChainId: number;
}): Promise<{ min: number; max: number }> => {
  if (selectedToken.bridgeMethod === BridgeMethod.canonical) {
    return getCanonicalMinAndMaxAmount({ srcChainId, selectedToken });
  } else {
    return getPoolMinAndMaxAmount({ srcChainId, selectedToken });
  }
};

const getPoolMinAndMaxAmount = async ({
  srcChainId,
  selectedToken,
}: {
  selectedToken: SelectedToken;
  srcChainId: number;
}): Promise<{ min: number; max: number }> => {
  try {
    const web3 = buildWeb3Instance(srcChainId);

    const { tokenAddress, decimals, contractAddress, symbol } = getTokenInfo({
      selectedToken,
      srcChainId,
    });

    if (!contractAddress || !tokenAddress || !web3 || !symbol) {
      throw new Error('Cannot find the web3 instance, contract or token address');
    }

    const contract = new web3.eth.Contract(POOL_ABI as AbiItem[], contractAddress);

    const isNativeToken = nativeCurrency[srcChainId].name === symbol;
    const token = isNativeToken ? await contract.methods.nativeWrap().call() : tokenAddress;

    const results = await Promise.all([
      contract.methods.minSend(token).call(),
      contract.methods.maxSend(token).call(),
    ]);

    return {
      min: Number(ethers.utils.formatUnits(results[0], decimals)),
      max: Number(ethers.utils.formatUnits(results[1], decimals)),
    };
  } catch (error: any) {
    console.error(error.message);
    return {
      min: 0,
      max: 0,
    };
  }
};

const getCanonicalMinAndMaxAmount = async ({
  srcChainId,
  selectedToken,
}: {
  selectedToken: SelectedToken;
  srcChainId: number;
}): Promise<{ min: number; max: number }> => {
  try {
    if (selectedToken.canonicalConfig === null) {
      throw Error('Cannot find Canonical Config');
    }

    const web3 = buildWeb3Instance(srcChainId);
    const { tokenAddress, decimals, symbol } = getTokenInfo({
      selectedToken,
      srcChainId,
    });

    const isDeposit = selectedToken.canonicalConfig.org_chain_id === srcChainId;
    const contractAddress = isDeposit
      ? selectedToken.canonicalConfig.pegged_deposit_contract_addr
      : selectedToken.canonicalConfig.pegged_burn_contract_addr;

    if (!contractAddress || !tokenAddress || !web3) {
      throw new Error('Cannot find the web3 instance, contract or token address');
    }

    const abi = isDeposit ? CANONICAL_DEPOSIT_ABI : CANONICAL_BURN_ABI;
    const contract = new web3.eth.Contract(abi as AbiItem[], contractAddress);
    const isNativeToken = nativeCurrency[srcChainId].name === symbol;

    if (isDeposit) {
      const nativeWrap = isNativeToken && (await contract.methods.nativeWrap().call());
      const results = await Promise.all([
        contract.methods.minDeposit(isNativeToken ? nativeWrap : tokenAddress).call(),
        contract.methods.maxDeposit(isNativeToken ? nativeWrap : tokenAddress).call(),
      ]);
      return {
        min: Number(ethers.utils.formatUnits(results[0], decimals)),
        max: Number(ethers.utils.formatUnits(results[1], decimals)),
      };
    }

    const results = await Promise.all([
      contract.methods.minBurn(tokenAddress).call(),
      contract.methods.maxBurn(tokenAddress).call(),
    ]);

    return {
      min: Number(ethers.utils.formatUnits(results[0], decimals)),
      max: Number(ethers.utils.formatUnits(results[1], decimals)),
    };
  } catch (error: any) {
    console.error(error.message);
    return {
      min: 0,
      max: 0,
    };
  }
};

export const approve = async ({
  address,
  selectedToken,
  srcChainId,
  provider,
}: {
  address: string;
  srcChainId: number;
  selectedToken: SelectedToken;
  provider: any;
}): Promise<string> => {
  if (!provider) {
    throw new Error('No wallet connected');
  }

  const { contractAddress, tokenAddress } = getTokenInfo({ selectedToken, srcChainId });

  if (!contractAddress) {
    throw new Error('No contractAddress to approve');
  }

  if (!tokenAddress) {
    throw new Error('No token to approve');
  }

  const web3 = new Web3(provider as any);
  const contract = new web3.eth.Contract(ABI as AbiItem[], tokenAddress);
  const gasPrice = await web3.eth.getGasPrice();
  const rawTx: TransactionConfig = {
    nonce: await web3.eth.getTransactionCount(address),
    gasPrice: web3.utils.toHex(gasPrice),
    from: address,
    to: tokenAddress,
    value: '0x0',
    data: contract.methods.approve(contractAddress, MaxUint256).encodeABI(),
  };

  const estimatedGas = await web3.eth.estimateGas(rawTx);
  const hash = await new Promise<string>(async (resolve, reject) => {
    await web3.eth
      .sendTransaction({ ...rawTx, gas: estimatedGas })
      .once('transactionHash', (transactionHash) => {
        resolve(transactionHash);
      });
  });

  return hash;
};

export const mintOrBurn = async ({
  selectedToken,
  amount,
  srcChainId,
  provider,
  address,
}: {
  amount: string;
  srcChainId: number;
  selectedToken: SelectedToken;
  provider: any;
  address: string;
}): Promise<string> => {
  if (!provider) {
    throw Error('No wallet connected');
  }

  if (!selectedToken.canonicalConfig) {
    throw Error('Cannot find Canonical Config');
  }

  const { tokenAddress, symbol, decimals, contractAddress } = getTokenInfo({
    selectedToken,
    srcChainId,
  });

  const peggedChainId = selectedToken.canonicalConfig.pegged_chain_id;
  const isDeposit = selectedToken.canonicalConfig.org_chain_id === srcChainId;

  if (!contractAddress || !tokenAddress || !symbol || !decimals) {
    throw new Error('Cannot find token information');
  }

  const web3 = new Web3(provider as any);
  const abi = isDeposit ? CANONICAL_DEPOSIT_ABI : CANONICAL_BURN_ABI;
  const contract = new web3.eth.Contract(abi as AbiItem[], contractAddress);
  const gasPrice = await web3.eth.getGasPrice();
  const isNativeToken = nativeCurrency[srcChainId].name === symbol;
  const sendAmount = ethers.utils.parseUnits(amount, decimals).toString();
  const timestamp = String(Math.floor(Date.now()));

  const getData = () => {
    if (isDeposit) {
      if (isNativeToken) {
        return contract.methods
          .depositNative(sendAmount, peggedChainId, address, timestamp)
          .encodeABI();
      }
      return contract.methods
        .deposit(tokenAddress, sendAmount, peggedChainId, address, timestamp)
        .encodeABI();
    }
    return contract.methods.burn(tokenAddress, sendAmount, address, timestamp).encodeABI();
  };

  const rawTx: TransactionConfig = {
    nonce: await web3.eth.getTransactionCount(address),
    gasPrice: web3.utils.toHex(gasPrice),
    from: address,
    to: contractAddress,
    value: isNativeToken ? sendAmount : '0x0',
    data: getData(),
  };

  const estimatedGas = await web3.eth.estimateGas(rawTx);
  const hash = await new Promise<string>(async (resolve, reject) => {
    await web3.eth
      .sendTransaction({ ...rawTx, gas: estimatedGas })
      .once('transactionHash', (transactionHash) => {
        resolve(transactionHash);
      });
  });

  return hash;
};

export const poolTransfer = async ({
  selectedToken,
  amount,
  srcChainId,
  destChainId,
  provider,
  address,
}: {
  amount: string;
  srcChainId: EvmChain;
  destChainId: EvmChain;
  selectedToken: SelectedToken;
  provider: any;
  address: string;
}): Promise<string> => {
  if (!provider) {
    throw Error('No wallet connected');
  }

  if (!selectedToken.poolConfig) {
    throw Error('Cannot find Pool Config');
  }

  const { tokenAddress, symbol, decimals, contractAddress } = getTokenInfo({
    selectedToken,
    srcChainId,
  });

  if (!contractAddress || !tokenAddress || !symbol || !decimals) {
    throw new Error('Cannot find token information');
  }

  const web3 = new Web3(provider as any);
  const contract = new web3.eth.Contract(POOL_ABI as AbiItem[], contractAddress);
  const gasPrice = await web3.eth.getGasPrice();
  const isNativeToken = nativeCurrency[srcChainId].name === symbol;
  const sendAmount = ethers.utils.parseUnits(amount, decimals).toString();
  const timestamp = String(Math.floor(Date.now()));

  // Memo: 3000 -> 0.3%
  let slippage_tolerance = 3000;
  const minimalMaxSlippage = await getMinimalMaxSlippage({
    srcChainId: srcChainId,
    selectedToken: selectedToken,
  });
  slippage_tolerance =
    slippage_tolerance > minimalMaxSlippage ? slippage_tolerance : minimalMaxSlippage;

  const getData = () => {
    if (isNativeToken) {
      return contract.methods
        .sendNative(address, sendAmount, destChainId, timestamp, slippage_tolerance)
        .encodeABI();
    }
    return contract.methods
      .send(address, tokenAddress, sendAmount, destChainId, timestamp, slippage_tolerance)
      .encodeABI();
  };

  const rawTx: TransactionConfig = {
    nonce: await web3.eth.getTransactionCount(address),
    gasPrice: web3.utils.toHex(gasPrice),
    from: address,
    to: contractAddress,
    value: isNativeToken ? sendAmount : '0x0',
    data: getData(),
  };

  const estimatedGas = await web3.eth.estimateGas(rawTx);
  const hash = await new Promise<string>(async (resolve, reject) => {
    await web3.eth
      .sendTransaction({ ...rawTx, gas: estimatedGas })
      .once('transactionHash', (transactionHash) => {
        resolve(transactionHash);
      });
  });

  return hash;
};

export const getMinimalMaxSlippage = async ({
  srcChainId,
  selectedToken,
}: {
  selectedToken: SelectedToken;
  srcChainId: number;
}): Promise<number> => {
  try {
    const web3 = buildWeb3Instance(srcChainId);
    const { contractAddress } = getTokenInfo({
      selectedToken,
      srcChainId,
    });
    if (!contractAddress || !web3) {
      throw new Error('Cannot find the web3 instance, or contract address');
    }

    const contract = new web3.eth.Contract(POOL_ABI as AbiItem[], contractAddress);
    return Number(await contract.methods.minimalMaxSlippage().call());
  } catch (error: any) {
    console.error(error.message);
    return 3000;
  }
};
