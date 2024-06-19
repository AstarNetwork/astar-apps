import { getXvmTransferContractAddress } from 'src/modules/xvm-transfer';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { ethers } from 'ethers';
import { inject, injectable } from 'inversify';
import { Erc20Token, getStoredXvmTokens } from 'src/modules/token';
import { IXvmRepository } from 'src/v2/repositories';
import { IEvmAssetsRepository } from 'src/v2/repositories/IEvmAssetsRepository';
import { Symbols } from 'src/v2/symbols';
import { XvmGetAssetsParam, XvmTransferParam } from './../../services/IXvmService';
import ABI_XVM_ERC20 from 'src/config/abi/XVM_ERC20_TRANSFER.json';
import { ContractPromise } from '@polkadot/api-contract';
import { IApi } from 'src/v2/integration';
import type { WeightV2 } from '@polkadot/types/interfaces';
import { buildEvmAddress, isValidEvmAddress } from '@astar-network/astar-sdk-core';

const WASM_GAS_LIMIT = 50000000000;
const PROOF_SIZE = 131072;

@injectable()
export class XvmRepository implements IXvmRepository {
  constructor(
    @inject(Symbols.DefaultApi) private api: IApi,
    @inject(Symbols.EvmAssetsRepository) private evmAssetsRepository: IEvmAssetsRepository
  ) {}

  public async getAssets({
    currentAccount,
    srcChainId,
    isFetchUsd,
  }: XvmGetAssetsParam): Promise<any[]> {
    const xvmAssets = getStoredXvmTokens();
    const assets = xvmAssets.filter((it) => it.srcChainId === srcChainId);
    const userAddress = buildEvmAddress(currentAccount);
    const result = await Promise.all(
      assets.map(async (item) => {
        const token: Erc20Token = {
          srcChainId: item.srcChainId,
          address: item.address,
          decimal: item.decimal,
          symbol: item.symbol,
          name: item.name,
          image: '',
          isWrappedToken: false,
          isXC20: false,
          bridgeUrl: null,
        };

        const { balUsd, userBalance } = await this.evmAssetsRepository.updateTokenBalanceHandler({
          userAddress,
          token,
          isFetchUsd,
          srcChainId,
        });
        return {
          ...item,
          userBalance,
          userBalanceUsd: String(balUsd),
        };
      })
    );

    return result;
  }

  public async getTransferCallData({
    token,
    recipientAddress,
    senderAddress,
    amount,
    finalizedCallback,
  }: XvmTransferParam): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> {
    const api = await this.api.getApi();
    const decimals = Number(token.decimal);
    const sendingAmount = ethers.utils.parseUnits(amount, decimals).toString();
    const contractAddress = getXvmTransferContractAddress();
    if (contractAddress === undefined) {
      new Error("Transfer contract addresses haven't defined");
    }

    const destAddress = isValidEvmAddress(recipientAddress)
      ? { EVM: recipientAddress }
      : { WASM: recipientAddress };

    const contract = new ContractPromise(api, ABI_XVM_ERC20, String(contractAddress));
    const initialGasLimit = contract.registry.createType<WeightV2>('WeightV2', {
      proofSize: PROOF_SIZE,
      refTime: WASM_GAS_LIMIT,
    });

    const { gasRequired } = await contract.query.transfer(
      senderAddress,
      { gasLimit: initialGasLimit },
      destAddress,
      sendingAmount,
      token.address
    );

    const gasLimit = api.registry.createType('WeightV2', gasRequired) as WeightV2;
    const transaction = contract.tx.transfer(
      { gasLimit },
      destAddress,
      sendingAmount,
      token.address
    );

    return transaction;
  }
}
