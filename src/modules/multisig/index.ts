export interface Multisig {
  multisigAccount: MultisigAddress;
  signatory: Signatory;
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
  proxy?: string;
  isProxyAccount?: boolean;
}

export interface Signatory {
  address: string;
  name: string;
  source: string;
}

export const addProxyAccounts = (input: MultisigAddress[]): MultisigAddress[] => {
  const output: MultisigAddress[] = [];

  for (let account of input) {
    // Memo: Normal account
    output.push({
      ...account,
      isProxyAccount: false,
    });

    // Memo: add Proxy account into the output array
    if (account.proxy) {
      const proxyAccount = {
        ...account,
        address: account.proxy,
        isProxyAccount: true,
      };
      output.push(proxyAccount);
    }
  }

  return output;
};
