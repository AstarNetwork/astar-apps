import Web3 from 'web3';

export const sendTransaction = async (
  web3: Web3,
  fromAddress: string,
  destinationAddress: string,
  transferAmt: number,
  callback: Function
) => {
  await web3.eth
    .sendTransaction({
      to: destinationAddress,
      from: fromAddress,
      value: web3.utils.toWei(String(transferAmt), 'ether'),
    })
    .once('confirmation', (confNumber, receipt) => {
      const hash = receipt.transactionHash;
      callback(hash);
    });
};
