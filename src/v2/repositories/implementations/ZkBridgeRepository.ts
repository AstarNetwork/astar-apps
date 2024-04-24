import ERC20_ABI from 'src/config/abi/ERC20.json';
import ASTR_OFT_ABI from 'src/config/web3/abi/oft-astar-native-abi.json';
import XC20_OFT_ABI from 'src/config/web3/abi/oft-bridge-abi.json';
import { ethers } from 'ethers';
import { injectable } from 'inversify';
import { astarNativeTokenErcAddr } from 'src/modules/xcm/tokens/index';
import {
  EthBridgeContract,
  EthBridgeNetworkName,
  ZK_EVM_AGGREGATED_BRIDGE_ABI,
  ZkNetworkId,
  fetchMerkleProof,
  getMainOrTestNet,
} from 'src/modules/zk-evm-bridge';
import { ParamBridgeAsset, ParamClaim, ParamBridgeLzAsset } from 'src/v2/services';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { IZkBridgeRepository } from '../IZkBridgeRepository';
import { addressToBytes32 } from 'src/config/web3';

@injectable()
export class ZkBridgeRepository implements IZkBridgeRepository {
  constructor() {}

  public async getApproveData({
    param,
    web3,
  }: {
    param: ParamBridgeAsset;
    web3: Web3;
  }): Promise<TransactionConfig> {
    const contractAddress = EthBridgeContract[param.fromChainName];
    const tokenAddress = param.tokenAddress;
    const contract = new web3.eth.Contract(ERC20_ABI as AbiItem[], tokenAddress);

    const data = contract.methods.approve(contractAddress, param.amount).encodeABI();
    return {
      from: param.senderAddress,
      to: tokenAddress,
      value: '0x0',
      data,
    };
  }

  public async getBridgeAssetData({
    param,
    web3,
  }: {
    param: ParamBridgeAsset;
    web3: Web3;
  }): Promise<TransactionConfig> {
    if (param.destNetworkId === undefined || param.destNetworkId === null) {
      throw Error('destNetworkId is not set');
    } else if (param.destNetworkId === ZkNetworkId.L2_PolygonZk) {
      // Memo: destNetworkId shouldn't be polygonZk but check it for just in case
      throw Error('destNetworkId is Polygon zkEVM');
    }

    const contractAddress = EthBridgeContract[param.fromChainName];

    const abi = ZK_EVM_AGGREGATED_BRIDGE_ABI;
    // ABI: https://github.com/0xPolygonHermez/zkevm-bridge-ui/blob/develop/abis/bridge.json
    const contract = new web3.eth.Contract(abi as AbiItem[], contractAddress);
    const isNativeToken = param.tokenAddress === astarNativeTokenErcAddr;
    const destinationAddress = param.senderAddress;
    const amount = ethers.utils.parseUnits(String(param.amount), param.decimal).toString();
    const forceUpdateGlobalExitRoot = true;
    const permitData = '0x';

    const data = contract.methods
      .bridgeAsset(
        param.destNetworkId,
        destinationAddress,
        amount,
        param.tokenAddress,
        forceUpdateGlobalExitRoot,
        permitData
      )
      .encodeABI();

    return {
      from: param.senderAddress,
      to: contractAddress,
      value: isNativeToken ? amount : '0x0',
      data,
    };
  }

  public async getBridgeLzAssetData({
    param,
    web3,
  }: {
    param: ParamBridgeLzAsset;
    web3: Web3;
  }): Promise<TransactionConfig> {
    console.log('param', param);

    const isNativeToken = true;

    const astarNative = '0xdf41220C7e322bFEF933D85D01821ad277f90172';
    const dotContract = '0x105C0F4a5Eae3bcb4c9Edbb3FD5f6b60FAcc3b36';

    const contractAddress = isNativeToken ? astarNative : dotContract;
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const adapterParams = isNativeToken
      ? // Value: 0x000100000000000000000000000000000000000000000000000000000000000186a0
        // ethers.utils.solidityPack(['uint16', 'uint256'], [1, 100000])
        ethers.utils.solidityPack(['uint16', 'uint256'], [1, 200000])
      : // Value: 0x00010000000000000000000000000000000000000000000000000000000000036ee8
        ethers.utils.solidityPack(['uint16', 'uint256'], [1, 225000]);

    console.log('adapterParams', adapterParams);

    const abi = isNativeToken ? ASTR_OFT_ABI : XC20_OFT_ABI;
    const contract = new web3.eth.Contract(abi as AbiItem[], contractAddress);

    const from = '0xb680c8f33f058163185ab6121f7582bab57ef8a7';
    const fromAddressByte32 = addressToBytes32(from);
    console.log('fromAddressByte32', fromAddressByte32);
    const destChainId = 257;
    const toAddress = fromAddressByte32;
    // const amount = 10;
    const amount = 0.05;
    const minAmount = amount * 0.995;
    const callParams = [from, zeroAddress, adapterParams];
    const decimal = isNativeToken ? 18 : 10;
    const qty = ethers.utils.parseUnits(String(amount), decimal);

    console.log('adapterParams', adapterParams);
    const fee = await contract.methods
      .estimateSendFee(destChainId, fromAddressByte32, qty, false, adapterParams)
      .call();
    console.log('fee', fee);

    const data = contract.methods
      .sendFrom(
        from,
        destChainId,
        toAddress,
        ethers.utils.parseUnits(String(amount), decimal),
        ethers.utils.parseUnits(String(minAmount), decimal),
        callParams
      )
      .encodeABI();
    console.log('data', data);

    // Memo: add 0.0001% fee here to avoid getting insufficient fee error
    const nativeFee = Number(ethers.utils.formatEther(String(fee[0]))) * 1.00001;
    console.log('amount', amount);
    console.log('nativeFee', nativeFee);
    const value = ethers.utils
      .parseEther(String(isNativeToken ? amount + nativeFee : nativeFee))
      .toString();
    console.log('value', value);
    return {
      from,
      to: contractAddress,
      value,
      data,
    };
  }

  public async getClaimData({
    param,
    web3,
  }: {
    param: ParamClaim;
    web3: Web3;
  }): Promise<TransactionConfig> {
    const { deposit_cnt, orig_net, orig_addr, dest_net, dest_addr, amount, metadata, network_id } =
      param.withdrawal;

    const network = getMainOrTestNet();
    const contractAddress =
      network === 'mainnet'
        ? EthBridgeContract[EthBridgeNetworkName.Ethereum]
        : EthBridgeContract[EthBridgeNetworkName.Sepolia];

    const abi = ZK_EVM_AGGREGATED_BRIDGE_ABI;
    const contract = new web3.eth.Contract(abi as AbiItem[], contractAddress);

    const { main_exit_root, merkle_proof, rollup_exit_root, rollup_merkle_proof } =
      await fetchMerkleProof(deposit_cnt, Number(network_id));

    const data = contract.methods
      .claimAsset(
        merkle_proof,
        rollup_merkle_proof,
        Number(param.withdrawal.global_index),
        main_exit_root,
        rollup_exit_root,
        orig_net,
        orig_addr,
        dest_net,
        dest_addr,
        amount,
        metadata
      )
      .encodeABI();

    return {
      from: param.senderAddress,
      to: contractAddress,
      data,
    };
  }
}
