// Copyright 2017-2021 @polkadot/app-custom-signature authors & contributors
// SPDX-License-Identifier: Apache-2.0
export interface ComponentProps {
  allAccounts: string[];
  className?: string;
  isMine: boolean;
  sudoKey?: string;
}

// Ethereum provider types
interface RequestArguments {
  method: string;
  params?: unknown[] | Record<string, unknown>;
}

export interface EthereumProvider {
  isMetaMask?: boolean;
  isTalisman?: boolean;
  isSubWallet?: boolean;
  chainId?: string;
  on: (event: string, handler: (response: any) => void) => void;
  removeListener: (event: string, handler: (response: any) => void) => void;
  request: (args: RequestArguments) => Promise<unknown>;
  // Memo: some wallets such as WalletConnect does have disconnect method
  disconnect: () => Promise<void> | undefined;
}

export interface EcdsaAddressFormat {
  ethereum: string;
  ss58?: string;
  h160?: string;
}
