import { TransactionConfig } from 'web3-eth';
import Web3 from 'web3';

export const getBalance = async (web3: Web3, address: string) => {
  return await web3.eth.getBalance(address);
};

export const sendNativeTokenTransaction = async (
  web3: Web3,
  fromAddress: string,
  destinationAddress: string,
  transferAmt: number,
  gasPrice: string,
  callback: Function
) => {
  const rawTx: TransactionConfig = {
    nonce: await web3.eth.getTransactionCount(fromAddress),
    gasPrice: web3.utils.toHex(gasPrice),
    from: fromAddress,
    to: destinationAddress,
    value: web3.utils.toWei(String(transferAmt), 'ether'),
  };

  const estimatedGas = await web3.eth.estimateGas(rawTx);

  await web3.eth
    .sendTransaction({ ...rawTx, gas: estimatedGas })
    .once('confirmation', (confNumber, receipt) => {
      const hash = receipt.transactionHash;
      callback(hash);
    });
};
