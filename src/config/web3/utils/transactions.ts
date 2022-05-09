import Web3 from 'web3';

export const getBalance = async (web3: Web3, address: string) => {
  return await web3.eth.getBalance(address);
};

export const sendNativeTokenTransaction = async (
  web3: Web3,
  fromAddress: string,
  destinationAddress: string,
  transferAmt: number,
  callback: Function
) => {
  // const gasLimit;
  await web3.eth
    .sendTransaction({
      to: destinationAddress,
      from: fromAddress,
      value: web3.utils.toWei(String(transferAmt), 'ether'),
      // type: 2,
      // maxPriorityFeePerGas: 21000000,
      // gasLimit: 21000,
      // type: '0x2',
      maxPriorityFeePerGas: '21000000',
      maxFeePerGas: '1000000',
    })
    .once('confirmation', (confNumber, receipt) => {
      const hash = receipt.transactionHash;
      callback(hash);
    });
};
