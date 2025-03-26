import { injectable } from 'inversify';
import ERC20_ABI from 'src/config/abi/ERC20.json';
import ETHER_SENDER_RECEIVER_ABI from 'src/config/web3/abi/ccip/EtherSenderReceiver.json';
import BURN_MINT_POOL_ABI from 'src/config/web3/abi/ccip/BurnMintTokenPool.json';
import LOCK_RELEASE_POOL_ABI from 'src/config/web3/abi/ccip/LockReleaseTokenPool.json';
import ROUTER_ABI from 'src/config/web3/abi/ccip/Router.json';
import type {
  ParamApproveCcip,
  ParamBridgeCcipAsset,
  ParamFetchOutboundLimits,
} from 'src/v2/services/ICcipBridgeService';
import type Web3 from 'web3';
import type { TransactionConfig } from 'web3-eth';
import type { AbiItem } from 'web3-utils';
import type { ICcipBridgeRepository } from '../ICcipBridgeRepository';
import {
  ccipBridgeAddress,
  ccipChainId,
  CcipChainId,
  ccipChainSelector,
  CcipNetworkName,
  ccipTokenPoolAddress,
} from 'src/modules/ccip-bridge';
import { astarNativeTokenErcAddr } from 'src/modules/xcm';
import { ethers } from 'ethers';

@injectable()
export class CcipBridgeRepository implements ICcipBridgeRepository {
  public async getApproveData({
    param,
    web3,
  }: {
    param: ParamApproveCcip;
    web3: Web3;
  }): Promise<TransactionConfig> {
    const { contractAddress, tokenAddress } = param;
    const contract = new web3.eth.Contract(ERC20_ABI as AbiItem[], tokenAddress);

    const data = contract.methods.approve(contractAddress, param.amount).encodeABI();
    return {
      from: param.senderAddress,
      to: tokenAddress,
      value: '0x0',
      data,
    };
  }

  public getMessageArgs(param: ParamBridgeCcipAsset): {
    destinationChainSelector: string;
    message: (string | (string | ethers.BigNumber)[][])[];
  } {
    const { destNetworkId, senderAddress, amount, tokenAddress, fromNetworkId } = param;
    const defaultAbiCoder = ethers.utils.defaultAbiCoder;

    const destinationChainSelector = ccipChainSelector[destNetworkId];
    const isSendToAstar = Boolean(
      destNetworkId === CcipChainId.AstarEvm || destNetworkId === CcipChainId.ShibuyaEvm
    );

    const receiverAddress = isSendToAstar ? ccipBridgeAddress[destNetworkId] : senderAddress;
    const receiver = defaultAbiCoder.encode(['address'], [receiverAddress]);
    const data = isSendToAstar ? defaultAbiCoder.encode(['address'], [senderAddress]) : '0x';
    const amt = ethers.utils.parseEther(String(amount)).toString();
    const tokenAmounts = [[tokenAddress, amt]];
    const feeToken = astarNativeTokenErcAddr;
    const functionSelector = ethers.utils.id('CCIP EVMExtraArgsV1').slice(0, 10);

    const gasLimit = 100000;
    const extraArgs = defaultAbiCoder.encode(['uint256', 'bool'], [gasLimit, false]);
    const encodedExtraArgs = functionSelector + extraArgs.slice(2);

    const message = [receiver, data, tokenAmounts, feeToken, encodedExtraArgs];
    return { destinationChainSelector, message };
  }

  public async getFee({
    param,
    web3,
  }: {
    param: ParamBridgeCcipAsset;
    web3: Web3;
  }): Promise<string> {
    const contractAddress = ccipBridgeAddress[param.fromNetworkId];

    const abi =
      param.fromNetworkId === ccipChainId[CcipNetworkName.ShibuyaEvm] ||
      param.fromNetworkId === ccipChainId[CcipNetworkName.AstarEvm]
        ? ETHER_SENDER_RECEIVER_ABI
        : ROUTER_ABI;

    const contract = new web3.eth.Contract(abi as AbiItem[], contractAddress);
    const { destinationChainSelector, message } = this.getMessageArgs(param);
    const fee = await contract.methods.getFee(destinationChainSelector, message).call();
    // Memo: Add 5% of fee for buffer
    const feeWithBuffer = ethers.BigNumber.from(fee).mul(105).div(100).toString();

    return feeWithBuffer;
  }

  public async getOutboundLimits({
    param,
    web3,
  }: {
    param: ParamFetchOutboundLimits;
    web3: Web3;
  }): Promise<string> {
    const isFromAstar = Boolean(
      param.fromNetworkId === CcipChainId.AstarEvm || param.fromNetworkId === CcipChainId.ShibuyaEvm
    );
    const remoteChainSelector = ccipChainSelector[param.destNetworkId];
    const contractAddress = ccipTokenPoolAddress[param.fromNetworkId];
    const abi = isFromAstar ? LOCK_RELEASE_POOL_ABI : BURN_MINT_POOL_ABI;
    const contract = new web3.eth.Contract(abi as AbiItem[], contractAddress);
    const outboundState = await contract.methods
      .getCurrentOutboundRateLimiterState(remoteChainSelector)
      .call();
    const remainCapacity = outboundState.tokens.toString();
    return ethers.utils.formatEther(remainCapacity);
  }

  public async getBridgeCcipAssetData({
    param,
    web3,
  }: {
    param: ParamBridgeCcipAsset;
    web3: Web3;
  }): Promise<{ txParam: TransactionConfig; nativeFee: number }> {
    const isNativeToken = Boolean(
      param.fromNetworkId === CcipChainId.AstarEvm || param.fromNetworkId === CcipChainId.ShibuyaEvm
    );
    const { message, destinationChainSelector } = this.getMessageArgs(param);
    const contractAddress = ccipBridgeAddress[param.fromNetworkId];

    const abi =
      param.fromNetworkId === ccipChainId[CcipNetworkName.ShibuyaEvm] ||
      param.fromNetworkId === ccipChainId[CcipNetworkName.AstarEvm]
        ? ETHER_SENDER_RECEIVER_ABI
        : ROUTER_ABI;

    const contract = new web3.eth.Contract(abi as AbiItem[], contractAddress);
    const data = contract.methods.ccipSend(destinationChainSelector, message).encodeABI();

    const fee = await this.getFee({ param, web3 });
    const nativeBridgeAmount = ethers.utils.parseEther(isNativeToken ? String(param.amount) : '0');
    const value = (BigInt(nativeBridgeAmount.toString()) + BigInt(fee)).toString();

    return {
      txParam: {
        from: param.senderAddress,
        to: contractAddress,
        value,
        data,
      },
      nativeFee: Number(ethers.utils.formatEther(fee)),
    };
  }
}
