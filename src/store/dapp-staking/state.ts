import { BN } from '@polkadot/util';
import { TvlModel } from 'src/v2/models';
import { DappCombinedInfo, StakerInfo } from 'src/v2/models/DappsStaking';

export type Category = 'defi' | 'gamefi' | 'infra' | 'nft' | 'others';

export interface DappItem extends LooseObject {
  name: string;
  iconUrl: string;
  description: string;
  descriptionMarkdown: string;
  url: string;
  address: string;
  license: string;
  videoUrl: string;
  tags: string[];
  forumUrl: string;
  authorContact: string;
  gitHubUrl: string;
  imagesUrl: string[];
  developers: Developer[];
  communities: Community[];
  platforms: string[];
  contractType: string;
  mainCategory: Category;
}

export interface NewDappItem extends DappItem {
  iconFileName: string;
  iconFile: string;
  icon: File;
  images: File[];
  imagesContent: string[];
  videoUrlInput: string;
}

export interface Developer {
  twitterAccountUrl: string;
  linkedInAccountUrl: string;
  iconFile: string;
  name: string;
}

export enum CommunityType {
  Twitter = 'Twitter',
  Reddit = 'Reddit',
  Facebook = 'Facebook',
  TikTok = 'TikTok',
  YouTube = 'YouTube',
  Instagram = 'Instagram',
}

export interface Community {
  type: CommunityType;
  handle: string;
}

export interface CommunityDefinition extends Community {
  iconUrl: string;
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
}

export interface LooseObject {
  [key: string]: any;
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
    tvl: new TvlModel(new BN(0), 0, 0),
    currentEra: 0,
  };
}

export default state;
