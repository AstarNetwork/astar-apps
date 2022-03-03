import { SelectedToken } from 'src/c-bridge';

export interface GeneralStateInterface {
  selectedToken: SelectedToken | null;
}

function state(): GeneralStateInterface {
  return {
    selectedToken: null,
  };
}

export default state;
