export interface DappStakingState {
  version: string;
}

function state(): DappStakingState {
  return {
    version: '3.0.0',
  };
}

export default state;
