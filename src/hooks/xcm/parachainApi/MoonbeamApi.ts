import { LOCAL_STORAGE } from './../../../config/localStorage';
import { EthereumProvider } from './../../types/CustomSignature';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import BN from 'bn.js';
import { supportEvmWallets, SupportWallet } from 'src/config/wallets';
import { EVM, getTokenBal, rpcUrls, setupNetwork } from 'src/config/web3';
import moonbeamXcmAbi from 'src/config/web3/abi/moonbeam-xcm-abi.json';
import { wait } from 'src/hooks/helper/common';
import { Asset } from 'src/v2/models';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { ChainApi } from '../SubstrateApi';
import { isValidEvmAddress } from './../../../config/web3/utils/convert';
import { getEvmProvider } from './../../helper/wallet';
import { ethers } from 'ethers';

type chainName = 'Moonriver' | 'Moonbeam';

// Ref: https://docs.moonbeam.network/builders/build/canonical-contracts/precompiles/erc20/
const NATIVE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000802';
const PRE_COMPILED_ADDRESS = '0x0000000000000000000000000000000000000804';
// Todo: check the token address for ASTR
const ASTAR_TOKEN_ID = { SDN: '0xffffffff0ca324c842330521525e7de111f38972', ASTR: '0xToDo' };
const RPC_ENDPOINT = {
  Moonriver: rpcUrls[EVM.MOONRIVER][0] as string,
  Moonbeam: rpcUrls[EVM.MOONBEAM][0] as string,
};
const EVM_ID = { Moonriver: EVM.MOONRIVER, Moonbeam: EVM.MOONBEAM };

export class MoonbeamApi extends ChainApi {
  private _networkName: chainName;
  private _web3: Web3 | null;
  constructor(endpoint: string) {
    super(endpoint);
    this._networkName = endpoint.includes('moonriver') ? 'Moonriver' : 'Moonbeam';
    this._web3 = new Web3(this.getEvmProvider() as any);
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
      const network = EVM_ID[this._networkName];
      setupNetwork({ network, provider });
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
      const chainName = this.chainProperty?.chainName as chainName;
      return networkId === EVM_ID[chainName];
    } catch (error) {
      return false;
    }
  }

  public async getNativeBalance(address: string): Promise<BN> {
    try {
      const web3 = new Web3(RPC_ENDPOINT[this._networkName]);
      const addr = isValidEvmAddress(address) ? address : await this.getEvmWalletAddress();
      const bal = (await web3.eth.getBalance(addr)) || '0';
      return new BN(bal);
    } catch (e) {
      console.error(e);
      return new BN(0);
    }
  }

  public async getTokenBalances({
    selectedToken,
    address,
    isNativeToken,
  }: {
    selectedToken: Asset;
    address: string;
    isNativeToken: boolean;
  }): Promise<string> {
    if (!address) return '0';
    const symbol = selectedToken.metadata.symbol;
    const isAstarNativeToken = symbol === 'SDN' || symbol === 'ASTR';
    try {
      if (isAstarNativeToken) {
        // if: SDN or ASTR
        const addr = await this.getEvmWalletAddress();
        const tokenAddress = ASTAR_TOKEN_ID[symbol];
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

  public async evmTransferToParachain({
    toPara,
    recipientAccountId,
    amount,
    selectedToken,
  }: {
    toPara: number;
    recipientAccountId: string;
    amount: string;
    selectedToken: Asset;
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
    const symbol = selectedToken.metadata.symbol;
    const isAstarNativeToken = symbol === 'SDN' || symbol === 'ASTR';
    if (isAstarNativeToken) {
      currencyAddress = ASTAR_TOKEN_ID[symbol];
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
    const estimatedGas = await this._web3.eth.estimateGas(rawTx);
    const txDetails = await this._web3.eth.sendTransaction({ ...rawTx, gas: estimatedGas });

    const blockMilliSec = 15000;
    // Memo: wait for syncing in Astar chain
    await wait(blockMilliSec);
    return txDetails.transactionHash;
  }
}
