import { hasProperty, wait } from '@astar-network/astar-sdk-core';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { web3Enable } from '@polkadot/extension-dapp';
import { ISubmittableResult } from '@polkadot/types/types';
import { EthereumProvider as WcEthereumProvider } from '@walletconnect/ethereum-provider';
import { ethers } from 'ethers';
import { get } from 'lodash-es';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { supportEvmWalletObj, SupportWallet, supportWalletObj } from 'src/config/wallets';
import { EVM } from 'src/config/web3';
import { ETHEREUM_EXTENSION } from 'src/hooks';
import { EthereumProvider } from 'src/hooks/types/CustomSignature';
import { deepLink } from 'src/links';
import { addTxHistories } from 'src/modules/account';
import { HistoryTxType } from 'src/modules/account/index';
import { showError } from 'src/modules/extrinsic';
import { SubstrateAccount } from 'src/store/general/state';
import { container } from 'src/v2/common';
import { Symbols } from 'src/v2/symbols';
import { Dispatch } from 'vuex';
import Web3 from 'web3';
declare global {
  interface Window {
    [key: string]: EthereumProvider;
  }
}

export const getInjectedExtensions = async (forceRequest = false): Promise<any[]> => {
  const selectedAddress = localStorage.getItem(LOCAL_STORAGE.SELECTED_ADDRESS);
  if (selectedAddress != null || forceRequest) {
    let extensions = await web3Enable('AstarNetwork/astar-apps');

    // const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    // Memo: Firefox takes some time to load the wallet extensions at the boot time.
    // Below code is for reference
    // if (isFirefox) {
    //   const injectedWeb3 = window.injectedWeb3;
    //   const numWalletExtensions = injectedWeb3 ? Object.values(window.injectedWeb3).length : 0;
    //   const maxRetry = 20;
    //   let numRetry = 0;
    //   while (extensions.length !== numWalletExtensions) {
    //     wait(400);
    //     extensions = await web3Enable('AstarNetwork/astar-apps');
    //     numRetry++;
    //     if (numRetry > maxRetry) {
    //       break;
    //     }
    //   }
    // }

    return extensions;
  }
  return [];
};

export const getSelectedAccount = (accounts: SubstrateAccount[]): SubstrateAccount | undefined => {
  try {
    const selectedAddress = localStorage.getItem(LOCAL_STORAGE.SELECTED_ADDRESS);
    const selectedWallet = localStorage.getItem(LOCAL_STORAGE.SELECTED_WALLET);
    if (selectedAddress === ETHEREUM_EXTENSION) {
      return undefined;
    }

    const account = accounts.find(
      (it) => it.address === selectedAddress && it.source === selectedWallet
    );
    return account;
  } catch (error: any) {
    console.error(error.message);
    return undefined;
  }
};

export const getInjector = async (accounts: SubstrateAccount[]) => {
  const account = getSelectedAccount(accounts);
  const extensions = await getInjectedExtensions();
  const injector = extensions.find((it) => it.name === account?.source);
  return injector;
};

export const isMobileDevice =
  'ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/);

export const castMobileSource = (source: string): string => {
  if (isMobileDevice) {
    // Memo: source as 'polkadot-js' in mobile app
    const polkadotJsWallets = [SupportWallet.Math, SupportWallet.Nova, SupportWallet.Gridlock];
    if (polkadotJsWallets.find((it) => it === source)) {
      return SupportWallet.PolkadotJs;
    }
  }
  return source;
};

export const addToEvmProvider = ({
  tokenAddress,
  symbol,
  decimals,
  image,
  provider,
}: {
  tokenAddress: string;
  symbol: string;
  decimals: number;
  image: string;
  provider: EthereumProvider;
}): void => {
  provider.request({
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC20',
      options: {
        address: tokenAddress,
        symbol,
        decimals,
        image: image.includes('custom-token') ? null : image,
      },
    },
  });
};

export const getDeepLinkUrl = (wallet: SupportWallet): string | false => {
  switch (wallet) {
    case SupportWallet.MetaMask:
      return deepLink.metamask;

    default:
      return false;
  }
};

export const checkIsWalletExtension = async (): Promise<boolean> => {
  const isSubstrateDappBrowser = !!(
    window.injectedWeb3 && JSON.stringify(window.injectedWeb3) !== '{}'
  );
  const isEvmWalletExtension =
    typeof window.ethereum !== 'undefined' ||
    typeof window.SubWallet !== 'undefined' ||
    typeof window.talismanEth !== 'undefined';
  return Boolean(isSubstrateDappBrowser || isEvmWalletExtension);
};

export const checkIsEthereumWallet = (wallet: SupportWallet): boolean => {
  return hasProperty(supportEvmWalletObj, wallet);
};

export const checkIsMobileMathWallet = async (): Promise<boolean> => {
  try {
    if (isMobileDevice) {
      const [wallet] = await getInjectedExtensions();
      const isMath = hasProperty(wallet, 'isMathWallet');
      return isMath;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

export type Transaction = SubmittableExtrinsic<'promise', ISubmittableResult>;

export const sign = async ({
  transaction,
  senderAddress,
  substrateAccounts,
  isCustomSignature,
  dispatch,
  getCallFunc,
  tip,
}: {
  transaction: Transaction;
  senderAddress: string;
  substrateAccounts: SubstrateAccount[];
  isCustomSignature: boolean;
  dispatch: Dispatch;
  getCallFunc: (call: Transaction) => Promise<Transaction>;
  tip?: string;
}): Promise<Transaction | undefined> => {
  if (isCustomSignature && getCallFunc) {
    const result = await getCallFunc(transaction);
    return result;
  } else {
    const injector = await getInjector(substrateAccounts);
    if (!injector) {
      throw Error('Invalid injector');
    }

    const result = await transaction.signAsync(senderAddress, {
      signer: injector.signer,
      nonce: -1,
      tip: tip ? ethers.utils.parseEther(String(tip)).toString() : '1',
    });

    return result;
  }
};

export const signAndSend = async ({
  transaction,
  senderAddress,
  substrateAccounts,
  isCustomSignature = false,
  dispatch,
  txResHandler,
  handleCustomExtrinsic,
  finalizeCallback,
  tip,
  txType,
}: {
  transaction: Transaction;
  senderAddress: string;
  substrateAccounts: SubstrateAccount[];
  isCustomSignature: boolean;
  dispatch: Dispatch;
  txResHandler: (result: ISubmittableResult) => Promise<boolean>;
  // from: useCustomSignature.ts
  handleCustomExtrinsic?: (method: Transaction) => Promise<void>;
  finalizeCallback?: () => void;
  tip?: string;
  txType?: HistoryTxType;
}): Promise<boolean> => {
  return new Promise<boolean>(async (resolve) => {
    const sendSubstrateTransaction = async (): Promise<void> => {
      const injector = await getInjector(substrateAccounts);
      if (!injector) {
        throw Error('Invalid injector');
      }
      await transaction.signAndSend(
        senderAddress,
        {
          signer: injector.signer,
          nonce: -1,
          tip: tip ? ethers.utils.parseEther(String(tip)).toString() : '1',
        },
        (result) => {
          (async () => {
            const res = await txResHandler(result);
            finalizeCallback && finalizeCallback();
            if (txType) {
              addTxHistories({
                hash: result.txHash.toString(),
                type: txType,
                address: senderAddress,
              });
            }
            resolve(res);
          })();
        }
      );
    };

    try {
      if (isCustomSignature && handleCustomExtrinsic) {
        await handleCustomExtrinsic(transaction);
        finalizeCallback && finalizeCallback();
        resolve(true);
      } else {
        await sendSubstrateTransaction();
      }
    } catch (error: any) {
      console.error(error.message);
      showError(dispatch, error.message);
      resolve(false);
    }
  });
};

export const checkIsNativeWallet = (selectedWallet: SupportWallet): boolean => {
  return hasProperty(supportWalletObj, selectedWallet);
};

const deleteWalletConnectDb = async (): Promise<void> => {
  indexedDB.deleteDatabase('WALLET_CONNECT_V2_INDEXED_DB');
  // Memo: wait for the DB to be deleted (above method doesn't return a promise)
  await wait(2000);
};

// Ref: https://docs.walletconnect.com/advanced/providers/ethereum
export const initWalletConnectProvider = async (): Promise<{
  provider: typeof WcEthereumProvider | undefined;
  chainId: number;
}> => {
  try {
    // await deleteWalletConnectDb();
    const astar = providerEndpoints[endpointKey.ASTAR];
    const shiden = providerEndpoints[endpointKey.SHIDEN];
    const shibuya = providerEndpoints[endpointKey.SHIBUYA];
    const zKatana = providerEndpoints[endpointKey.ZKATANA];
    const astarZkEvm = providerEndpoints[endpointKey.ASTAR_ZKEVM];

    const getProvider = async () => {
      const provider = (await WcEthereumProvider.init({
        // Memo: this can be committed as it can be exposed on the browser anyway
        projectId: 'c236cca5c68248680dd7d0bf30fefbb5',
        showQrModal: true,
        optionalChains: [
          Number(astar.evmChainId),
          Number(shiden.evmChainId),
          Number(shibuya.evmChainId),
          // Number(astarZkEvm.evmChainId),
          Number(zKatana.evmChainId),
          // EVM.SEPOLIA_TESTNET,
        ],
        chains: [EVM.ETHEREUM_MAINNET],
        rpcMap: {
          [astar.evmChainId]: astar.evmEndpoints[0],
          [shiden.evmChainId]: shiden.evmEndpoints[0],
          [shibuya.evmChainId]: shibuya.evmEndpoints[0],
          // [astarZkEvm.evmChainId]: astarZkEvm.evmEndpoints[0],
          [zKatana.evmChainId]: zKatana.evmEndpoints[0],
          // [String(EVM.SEPOLIA_TESTNET)]: String(rpcUrls[EVM.SEPOLIA_TESTNET][0]),
        },
      })) as any;
      return provider;
    };
    const provider = await getProvider();
    console.log('provider.connected', provider.connected);
    console.log('await provider.connected', await provider.connected);
    const isConnected = await provider.connected;
    if (isConnected) {
      try {
        const result = await provider.disconnect();
        console.log('deleted', result);
      } catch (error) {
        console.error(error);
      }
    }

    await provider.connect();
    await wait(2000);
    // await provider.enable();
    console.log('connected');
    console.log('provider', provider);
    // await provider.enable();
    const web3 = new Web3(provider as any);
    const accounts = await web3.eth.getAccounts();
    console.log('accounts', accounts);
    const balWei = await web3.eth.getBalance('0xD181Fd5a9D3178F497668e0cb2aD57B53D7EaeA7');

    console.log('balWei', balWei);
    // const web3 = new Web3(provider);
    // const tx = {
    //   from: accounts[0],
    //   to: accounts[0],
    //   value: '1000000000000000000',
    // };
    // const hash = await web3.eth.sendTransaction(tx);
    // Memo: to wait for syncing the correct chainId in provider
    await wait(2000);
    container.addConstant<typeof WcEthereumProvider>(Symbols.WcProvider, provider);
    // Memo: update the ethProvider in useEthProvider.ts
    window.dispatchEvent(new CustomEvent(SupportWallet.WalletConnect));

    provider.on('connect', () => {
      // localStorage.setItem('walletconnect', JSON.stringify(provider.session));
      console.log('hello');
    });
    provider.on('disconnect', async () => {
      console.log('disconnecting');
      await provider.disconnect();
      // localStorage.removeItem('walletconnect');
    });

    return { provider, chainId: provider.chainId };
  } catch (error: any) {
    console.error(error);
    throw Error(error.message);
  }
};

export const getWcProvider = (): EthereumProvider | null => {
  let wcProvider;
  // Memo: ignore the error if it's not founded (before binding the provider)
  try {
    wcProvider = container.get<EthereumProvider>(Symbols.WcProvider);
  } catch (error) {}
  return wcProvider ? wcProvider : null;
};

export const getEvmProvider = (walletName: SupportWallet): EthereumProvider | null => {
  if (walletName === SupportWallet.WalletConnect) {
    return getWcProvider();
  }
  const wallet = supportEvmWalletObj[walletName as keyof typeof supportEvmWalletObj];
  const provider = wallet ? (get(window, wallet.ethExtension) as EthereumProvider) : undefined;
  const isExtension =
    wallet && walletName === wallet.source && typeof provider !== undefined && provider;

  return isExtension ? provider : null;
};
