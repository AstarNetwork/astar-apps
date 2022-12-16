import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { ethers } from 'ethers';
import { inject, injectable } from 'inversify';
import { buildEvmAddress } from 'src/config/web3';
import { Erc20Token, getStoredXvmTokens } from 'src/modules/token';
import { IXvmRepository } from 'src/v2/repositories';
import { IEvmAssetsRepository } from 'src/v2/repositories/IEvmAssetsRepository';
import { Symbols } from 'src/v2/symbols';
import { XvmGetAssetsParam, XvmTransferParam } from './../../services/IXvmService';
import ABI_WASM_ERC20 from 'src/config/abi/WASM-ERC20.json';
import ABI_WASM_PSP22 from 'src/config/abi/WASM-PSP22.json';
import { ContractPromise } from '@polkadot/api-contract';
import { IApi } from 'src/v2/integration';
import type { WeightV2 } from '@polkadot/types/interfaces';

export const ASTAR_ADDRESS_PREFIX = 5;
const WASM_GAS_LIMIT = 50000000000;
// const WASM_GAS_LIMIT = 7000000000;
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
          address: item.erc20Contract,
          decimal: item.decimal,
          symbol: item.symbol,
          name: item.name,
          image: '',
          isWrappedToken: false,
          isXC20: false,
          wrapUrl: null,
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
    isWasmErc20,
    finalizedCallback,
  }: XvmTransferParam): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> {
    const api = await this.api.getApi();

    const decimals = Number(token.decimal);
    const sendingAmount = ethers.utils.parseUnits(amount, decimals).toString();
    const contractJson = isWasmErc20 ? ABI_WASM_ERC20 : ABI_WASM_PSP22;
    const contractAddress = isWasmErc20 ? token.xvmErc20Contract : token.xvmPsp22Contract;
    const contract = new ContractPromise(api, contractJson, contractAddress);

    const initialGasLimit = contract.registry.createType('WeightV2', {
      proofSize: PROOF_SIZE,
      refTime: WASM_GAS_LIMIT,
    });

    const { gasRequired } = isWasmErc20
      ? await contract.query.transfer(
          senderAddress,
          { gasLimit: initialGasLimit },
          recipientAddress,
          sendingAmount
        )
      : await contract.query.transfer(
          senderAddress,
          { gasLimit: initialGasLimit, storageDepositLimit: null },
          recipientAddress,
          sendingAmount,
          []
        );

    const gasLimit = api.registry.createType('WeightV2', gasRequired) as WeightV2;

    const transaction = isWasmErc20
      ? contract.tx.transfer({ gasLimit }, recipientAddress, sendingAmount)
      : contract.tx.transfer(
          { gasLimit, storageDepositLimit: null },
          recipientAddress,
          sendingAmount,
          []
        );

    return transaction;
  }
}
