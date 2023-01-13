import Web3 from 'web3';

export const getBalance = async (web3: Web3, address: string) => {
  return await web3.eth.getBalance(address);
};
