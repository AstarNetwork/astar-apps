import { BigNumber } from 'ethers';
import { BridgeHistory, EthBridgeNetworkName } from 'src/modules/zk-evm-bridge';

export interface IZkBridgeService {
  approve(param: ParamBridgeAsset): Promise<String>;
  bridgeAsset(param: ParamBridgeAsset): Promise<String>;
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

export interface ParamClaim {
  senderAddress: string;
  withdrawal: BridgeHistory;
}
