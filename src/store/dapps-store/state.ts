export interface DappItem {
	name: string;
	icon: string;
	description: string;
	url: string;
  address:string;
}

export interface NewDappItem extends DappItem {
  iconFileName: string;
  iconFile: string;
}

export interface DappStateInterface {
  dapps: DappItem[];
}

function state(): DappStateInterface {
  return {
    dapps: []
  }
}

export default state;