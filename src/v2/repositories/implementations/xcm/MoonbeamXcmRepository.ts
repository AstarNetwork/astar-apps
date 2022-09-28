import { u8aToHex, BN } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { supportEvmWallets, SupportWallet } from 'src/config/wallets';
import { EVM, getTokenBal, setupNetwork } from 'src/config/web3';
import moonbeamXcmAbi from 'src/config/web3/abi/moonbeam-xcm-abi.json';
import { getQueryParams } from 'src/hooks/helper/common';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import { EthereumProvider } from 'src/hooks/types/CustomSignature';
import { XcmTokenInformation } from 'src/modules/xcm';
import { container } from 'src/v2/common';
import { IApi, IApiFactory } from 'src/v2/integration';
import { Asset, XcmChain } from 'src/v2/models';
import { XcmRepository } from 'src/v2/repositories/implementations/XcmRepository';
import { Symbols } from 'src/v2/symbols';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { capitalize } from 'src/hooks/helper/common';
import { isValidEvmAddress } from 'src/config/web3';
import { ethers } from 'ethers';
import { AstarNativeToken } from 'src/v2/config/xcm/XcmRepositoryConfiguration';

type ChainName = 'Moonriver' | 'Moonbeam';

export const MOONBEAM_ASTAR_TOKEN_ID: AstarNativeToken = {
  SDN: '0xffffffff0ca324c842330521525e7de111f38972',
  ASTR: '0xffffffffa893ad19e540e172c10d78d4d479b5cf',
};

// Ref: https://docs.moonbeam.network/builders/build/canonical-contracts/precompiles/erc20/
const NATIVE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000802';
const PRE_COMPILED_ADDRESS = '0x0000000000000000000000000000000000000804';
const EVM_ID = { Moonriver: EVM.MOONRIVER, Moonbeam: EVM.MOONBEAM };

/**
 * Used to transfer assets from Moonbeam/Moonriver
 */

export class MoonbeamXcmRepository extends XcmRepository {
  private _networkName: ChainName;
  private _web3: Web3 | null;
  constructor() {
    const defaultApi = container.get<IApi>(Symbols.DefaultApi);
    const apiFactory = container.get<IApiFactory>(Symbols.ApiFactory);
    const registeredTokens = container.get<XcmTokenInformation[]>(Symbols.RegisteredTokens);
    super(defaultApi, apiFactory, registeredTokens);
    const queryParams = getQueryParams();
    const chain = capitalize(queryParams.from);
    this._networkName = chain as ChainName;
    this._web3 = new Web3(this.getEvmProvider() as any);
    this.astarTokens = MOONBEAM_ASTAR_TOKEN_ID;
  }

  public getEvmProvider(): EthereumProvider | null {
    try {
      let providerName: SupportWallet;
      const storedProvider = localStorage.getItem(LOCAL_STORAGE.XCM_DEPOSIT_EVM_WALLET);
      if (storedProvider) {
        providerName = storedProvider as SupportWallet;
      } else {
        const evmExtensions = supportEvmWallets.filter((it) => it.isSupportBrowserExtension);
        const wallets = evmExtensions.map((it) => {
          const provider = getEvmProvider(it.source);
          if (provider) {
            return it.source;
          }
        });
        providerName = wallets[0] as SupportWallet;
      }

      if (!providerName) {
        throw Error('EVM wallet extensions are not installed on this browser');
      }
      const provider = getEvmProvider(providerName) as any;
      if (this._networkName === 'Moonriver' || this._networkName === 'Moonbeam') {
        const network = EVM_ID[this._networkName as keyof typeof EVM_ID];
        setupNetwork({ network, provider });
      }
      return provider ? (provider as EthereumProvider) : null;
    } catch (error) {
      return null;
    }
  }

  public async getEvmWalletAddress(): Promise<string> {
    try {
      if (!this._web3) return '';
      const [account] = (await this._web3?.eth.getAccounts()) as string[];
      return account || '';
    } catch (error) {
      return '';
    }
  }

  public async isConnectedNetwork(): Promise<boolean> {
    try {
      if (!this._web3) return false;
      const networkId = await this._web3.eth.net.getId();
      return networkId === EVM_ID[this._networkName];
    } catch (error) {
      return false;
    }
  }

  public async evmTransferToParachain({
    toPara,
    recipientAccountId,
    amount,
    token,
  }: {
    toPara: number;
    recipientAccountId: string;
    amount: string;
    token: Asset;
  }): Promise<string> {
    const isConnectedNetwork = await this.isConnectedNetwork();
    if (!isConnectedNetwork) throw Error('EVM wallet has been connected to the wrong network');
    if (!this._web3) throw Error('web3 instance is not defined');

    const contract = new this._web3.eth.Contract(moonbeamXcmAbi as AbiItem[], PRE_COMPILED_ADDRESS);
    const address = await this.getEvmWalletAddress();
    const [nonce, gasPrice] = await Promise.all([
      this._web3.eth.getTransactionCount(address),
      this._web3.eth.getGasPrice(),
    ]);

    let currencyAddress = '';
    const symbol = token.metadata.symbol;

    if (this.isAstarNativeToken(token)) {
      currencyAddress = <string>this.astarTokens[symbol];
    } else {
      currencyAddress = NATIVE_TOKEN_ADDRESS;
    }

    const destinationParents = '1';
    const paraId = String(toPara);

    // Ref: https://docs.moonbeam.network/builders/xcm/xcm-transactor/
    const parachainId = '0x00000007d' + paraId[paraId.length - 1];
    const stripPrefixDestAddr = this._web3.utils.stripHexPrefix(
      u8aToHex(decodeAddress(recipientAccountId))
    );
    const destAddress = '0x01' + stripPrefixDestAddr + '00';
    const destination = [destinationParents, [parachainId, destAddress]];
    const weight = '4000000000';

    const rawTx: TransactionConfig = {
      nonce,
      gasPrice: this._web3.utils.toHex(gasPrice),
      from: address,
      to: PRE_COMPILED_ADDRESS,
      value: '0x0',
      data: contract.methods.transfer(currencyAddress, amount, destination, weight).encodeABI(),
    };
    const estimatedGas = await this._web3.eth.estimateGas(rawTx).catch((error) => {
      throw Error('Insufficient funds to cover the cost of gas');
    });
    const txDetails = await this._web3.eth.sendTransaction({ ...rawTx, gas: estimatedGas });

    return txDetails.transactionHash;
  }

  public async getTokenBalance(
    address: string,
    chain: XcmChain,
    token: Asset,
    isNativeToken: boolean
  ): Promise<string> {
    if (!address) return '0';
    const symbol = token.metadata.symbol;

    try {
      if (this.isAstarNativeToken(token)) {
        // if: SDN or ASTR
        const addr = await this.getEvmWalletAddress();
        const tokenAddress = <string>this.astarTokens[symbol];
        const srcChainId = EVM_ID[this._networkName];
        const balance = await getTokenBal({
          address: addr,
          tokenAddress,
          tokenSymbol: symbol,
          srcChainId,
        });
        return ethers.utils.parseEther(balance).toString();
      } else {
        // if: MOVR or GLMR
        return (await this.getNativeBalance(address)).toString();
      }
    } catch (e) {
      console.error(e);
      return '0';
    }
  }

  public async getNativeBalance(address: string): Promise<BN> {
    try {
      const addr = isValidEvmAddress(address) ? address : await this.getEvmWalletAddress();
      const bal = (await this._web3?.eth.getBalance(addr)) || '0';
      return new BN(bal);
    } catch (e) {
      console.error(e);
      return new BN(0);
    }
  }
}
