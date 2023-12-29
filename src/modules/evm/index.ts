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

  return {
    nonce,
    from,
    to,
    value: value ? value : '0x0',
    data,
  };
};
