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
}

export interface Signatory {
  address: string;
  name: string;
  source: string;
}
