export interface DappItem {
	name: string;
	icon: string;
	description: string;
	dappUrl: string;
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