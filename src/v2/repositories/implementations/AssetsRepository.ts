import { buildEvmAddress } from '@astar-network/astar-sdk-core';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { BN } from '@polkadot/util';
import { ethers } from 'ethers';
import { inject, injectable } from 'inversify';
import ERC20_ABI from 'src/config/abi/ERC20.json';
import { astarNativeTokenErcAddr, idAstarNativeToken } from 'src/modules/xcm/tokens/index';
import { IApi } from 'src/v2/integration';
import { IGasPriceProvider } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import {
  ParamAssetTransfer,
  ParamEvmTransfer,
  ParamEvmWithdraw,
} from './../../services/IAssetsService';
import { IAssetsRepository } from './../IAssetsRepository';
import { FrameSystemAccountInfo } from './SystemRepository';
@injectable()
export class AssetsRepository implements IAssetsRepository {
  constructor(
    @inject(Symbols.DefaultApi) protected api: IApi,
    @inject(Symbols.GasPriceProvider) private gasPriceProvider: IGasPriceProvider
  ) {}

  public async getNativeTransferCall({
    assetId,
    receivingAddress,
    amount,
  }: ParamAssetTransfer): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> {
    const api = await this.api.getApi();
    return assetId === idAstarNativeToken
      ? api.tx.balances.transferKeepAlive(receivingAddress, amount)
      : api.tx.assets.transfer(new BN(assetId), receivingAddress, amount);
  }
  public async getEvmTransferData({
    param,
    web3,
  }: {
    param: ParamEvmTransfer;
    web3: Web3;
  }): Promise<TransactionConfig> {
    const { contractAddress, senderAddress, toAddress, amount, decimals } = param;
    if (contractAddress === astarNativeTokenErcAddr) {
      return {
        from: senderAddress,
        to: toAddress,
        value: web3.utils.toWei(String(amount), 'ether'),
      };
    } else {
      const contract = new web3.eth.Contract(ERC20_ABI as AbiItem[], contractAddress);
      const amt = ethers.utils.parseUnits(String(amount), decimals).toString();
      return {
        from: senderAddress,
        to: contractAddress,
        value: '0x0',
        data: contract.methods.transfer(toAddress, amt).encodeABI(),
      };
    }
  }

  public async getEvmWithdrawCall({
    amount,
    senderAddress,
  }: ParamEvmWithdraw): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> {
    const api = await this.api.getApi();
    const h160Addr = buildEvmAddress(senderAddress);
    return api.tx.evm.withdraw(h160Addr, amount);
  }

  public async getVestCall(): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> {
    const api = await this.api.getApi();
    return api.tx.vesting.vest();
  }

  public async getNativeBalance(address: string): Promise<string> {
    try {
      const api = await this.api.getApi();
      const { data } = await api.query.system.account<FrameSystemAccountInfo>(address);
      const transferableBal = (data.free.toBn() as BN).sub(new BN(data.frozen));
      return transferableBal.toString();
    } catch (e) {
      console.error(e);
      return '0';
    }
  }
}
