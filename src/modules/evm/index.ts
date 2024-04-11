import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';

export const getRawEvmTransaction = async (
  web3: Web3,
  from: string,
  to: string,
  data: string,
  value?: string
): Promise<TransactionConfig> => {
  const nonce = await web3.eth.getTransactionCount(from);

  // Memo: Set `null` for maxPriorityFeePerGas and maxFeePerGas to avoid "This gas fee has been suggested by" message in MetaMask using web3js
  // Ref: https://stackoverflow.com/questions/68926306/how-to-avoid-this-gas-fee-has-been-suggested-by-message-in-metamask-using-web3
  return {
    nonce,
    from,
    to,
    value: value ? value : '0x0',
    data,
    maxPriorityFeePerGas: null,
    maxFeePerGas: null,
  } as any;
};
