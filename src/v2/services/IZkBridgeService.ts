import { BigNumber } from 'ethers';
import {
  BridgeHistory,
  EthBridgeNetworkName,
  LayerZeroBridgeNetworkName,
  LayerZeroId,
  LayerZeroToken,
} from 'src/modules/zk-evm-bridge';

export interface IZkBridgeService {
  approve(param: ParamBridgeAsset): Promise<String>;
  bridgeAsset(param: ParamBridgeAsset): Promise<String>;
  bridgeLzAsset(param: ParamBridgeLzAsset): Promise<String>;
  dryRunBridgeAsset(param: ParamBridgeAsset): Promise<boolean>;
  claimAsset(param: ParamClaim): Promise<String>;
}

export interface ParamBridgeAsset {
  senderAddress: string;
  amount: string | BigNumber;
  fromChainName: EthBridgeNetworkName;
  toChainName: EthBridgeNetworkName;
  destNetworkId?: number;
  tokenAddress: string;
  decimal: number;
}

export interface ParamBridgeLzAsset {
  senderAddress: string;
  amount: number;
  minAmount: number;
  fromChainName: LayerZeroBridgeNetworkName;
  toChainName: LayerZeroBridgeNetworkName;
  destNetworkId: LayerZeroId;
  fromNetworkId: LayerZeroId;
  tokenAddress: string;
  token: LayerZeroToken;
}

export interface ParamClaim {
  senderAddress: string;
  withdrawal: BridgeHistory;
}
