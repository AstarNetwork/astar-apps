export interface DappItem extends LooseObject {
  name: string;
  iconUrl: string;
  description: string;
  url: string;
  address: string;
  license: string;
  videoUrl: string;
  tags: string[];
  forumUrl: string;
  authorContact: string;
  gitHubUrl: string;
  imagesUrl: string[];
}

export interface NewDappItem extends DappItem {
  iconFileName: string;
  iconFile: string;
  images: File[];
  imagesContent: string[];
  videoUrlInput: string;
}

export interface DappStateInterface {
  dapps: DappItem[];
  minimumStakingAmount: string;
  maxNumberOfStakersPerContract: number;
}

export interface LooseObject {
  [key: string]: any;
}

function state(): DappStateInterface {
  return {
    dapps: [],
    minimumStakingAmount: '0',
    maxNumberOfStakersPerContract: 0,
  };
}

export default state;
