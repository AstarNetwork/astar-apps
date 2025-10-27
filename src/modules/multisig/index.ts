import { sortAddresses } from '@polkadot/util-crypto';

export interface Multisig {
  multisigAccount: MultisigAddress;
  signatory: Signatory;
}

export interface ProxyAccount {
  address: string;
  name: string;
}

export interface MultisigAddress {
  signatories: string[];
  address: string;
  updated_at: Date;
  name: string;
  created_at: Date;
  disabled: boolean;
  threshold: number;
  network: string;
  balance: string;
  proxy?: Array<ProxyAccount>;
  isProxyAccount?: boolean;
  multisigAddress?: string;
}

export interface Signatory {
  address: string;
  name: string;
  source: string;
}

export const addProxyAccounts = (input: MultisigAddress[]): MultisigAddress[] => {
  const output: MultisigAddress[] = [];
  const uniqueAddresses = new Set();

  for (let account of input) {
    if (!uniqueAddresses.has(account.address)) {
      uniqueAddresses.add(account.address);
      // Memo: Normal account
      output.push({
        ...account,
        signatories: sortAddresses(account.signatories),
        isProxyAccount: false,
      });

      // Memo: add Proxy account into the output array
      if (account.proxy && Array.isArray(account.proxy) && account.proxy.length > 0) {
        for (const proxy of account.proxy) {
          if (!uniqueAddresses.has(proxy.address)) {
            uniqueAddresses.add(proxy.address);
            const sortedSignatories = sortAddresses(account.signatories);
            output.push({
              ...account,
              multisigAddress: account.address,
              address: proxy.address,
              name: proxy.name,
              signatories: sortedSignatories,
              isProxyAccount: true,
            });
          }
        }
      }
    }
  }

  return output;
};
