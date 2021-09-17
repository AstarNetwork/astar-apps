export interface DappItem {
	name: string;
	icon: string;
	description: string;
	url: string;
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