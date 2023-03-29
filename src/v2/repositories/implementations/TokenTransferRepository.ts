import { idAstarNativeToken, astarNativeTokenErcAddr } from 'src/modules/xcm/tokens/index';
import { AssetTransferParam, EvmTransferParam } from './../../services/ITokenTransferService';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { inject, injectable } from 'inversify';
import { IApi } from 'src/v2/integration';
import { Symbols } from 'src/v2/symbols';
import { ITokenTransferRepository } from './../ITokenTransferRepository';
import { BN } from '@polkadot/util';
import { TransactionConfig } from 'web3-eth';
import Web3 from 'web3';
import { getEvmGas } from '@astar-network/astar-sdk-core';
import { AbiItem } from 'web3-utils';
import ERC20_ABI from 'src/config/abi/ERC20.json';
import { IGasPriceProvider } from 'src/v2/services';
import { ethers } from 'ethers';
@injectable()
export class TokenTransferRepository implements ITokenTransferRepository {
  constructor(
    @inject(Symbols.DefaultApi) protected api: IApi,
    @inject(Symbols.GasPriceProvider) private gasPriceProvider: IGasPriceProvider
  ) {}

  public async getNativeTransferCall({
    assetId,
    receivingAddress,
    amount,
  }: AssetTransferParam): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> {
    const api = await this.api.getApi();
    return assetId === idAstarNativeToken
      ? api.tx.balances.transferKeepAlive(receivingAddress, amount)
      : api.tx.assets.transferKeepAlive(new BN(assetId), receivingAddress, amount);
  }
  public async getEvmTransferData({
    param,
    web3,
  }: {
    param: EvmTransferParam;
    web3: Web3;
  }): Promise<TransactionConfig> {
    const { contractAddress, senderAddress, toAddress, amount, decimals } = param;
    const [nonce, gasPrice] = await Promise.all([
      web3.eth.getTransactionCount(senderAddress),
      getEvmGas(web3, this.gasPriceProvider.getGas().price),
    ]);
    if (contractAddress === astarNativeTokenErcAddr) {
      return {
        nonce,
        gasPrice: web3.utils.toHex(gasPrice),
        from: senderAddress,
        to: toAddress,
        value: web3.utils.toWei(String(amount), 'ether'),
      };
    } else {
      const contract = new web3.eth.Contract(ERC20_ABI as AbiItem[], contractAddress);
      const amt = ethers.utils.parseUnits(String(amount), decimals).toString();
      return {
        nonce,
        gasPrice: web3.utils.toHex(gasPrice),
        from: senderAddress,
        to: contractAddress,
        value: '0x0',
        data: contract.methods.transfer(toAddress, amt).encodeABI(),
      };
    }
  }
}
