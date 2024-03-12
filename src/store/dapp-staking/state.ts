import { Community, DappItem } from '@astar-network/astar-sdk-core';
import { SocialIcon } from '@astar-network/astar-ui';
import { TvlModel } from 'src/v2/models';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';

export interface NewDappItem extends DappItem {
  iconFileName: string;
  iconFile: string;
  icon: File;
  images: File[];
  imagesContent: string[];
  videoUrlInput: string;
}

export interface EditDappItem extends DappItem {
  iconFile: FileInfo;
  images: FileInfo[];
}

export interface CommunityDefinition extends Community {
  iconName: SocialIcon;
  label: string;
  validateHandle?: (v: string) => boolean | string;
}

export interface DappStateInterface {
  dapps: DappItem[]; // TODO for backward compatibility only, remove later.
  dappsCombinedInfo: DappCombinedInfo[];
  minimumStakingAmount: string;
  maxNumberOfStakersPerContract: number;
  unbondingPeriod: number;
  maxUnlockingChunks: number;
  unlockingChunks: number;
  isPalletDisabled: boolean;
  claimedRewards: number;
  tvl: TvlModel;
  currentEra: number;
  decommission: boolean;
}

export interface FileInfo {
  name: string;
  base64content: string;
  contentType: string;
}

function state(): DappStateInterface {
  return {
    dapps: [],
    dappsCombinedInfo: [],
    minimumStakingAmount: '0',
    maxNumberOfStakersPerContract: 0,
    unbondingPeriod: 0,
    maxUnlockingChunks: 0,
    unlockingChunks: 0,
    isPalletDisabled: false,
    claimedRewards: 0,
    tvl: new TvlModel('0', 0, 0),
    currentEra: 0,
    decommission: false,
  };
}

export default state;
