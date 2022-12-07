export interface AutoStakingConfig {
  selfParaId: number;
  oakParaId: number;
  oakEndpoint: string;
  oakSS58Prefix: number;
}

export const autoStakingConfig: AutoStakingConfig[] = [
  // ASTAR
  {
    selfParaId: 2006,
    oakParaId: 2090,
    oakEndpoint: 'wss://rpc.oak.tech',
    oakSS58Prefix: 51,
  },
  // SHIDEN
  {
    selfParaId: 2007,
    oakParaId: 2114,
    oakEndpoint: 'wss://rpc.turing.oak.tech',
    oakSS58Prefix: 51,
  },
  // SHIBUYA
  {
    selfParaId: 0,
    oakParaId: 0,
    oakEndpoint: '',
    oakSS58Prefix: 42,
  },
  // DEV
  {
    selfParaId: 0,
    oakParaId: 0,
    oakEndpoint: '',
    oakSS58Prefix: 0,
  },
  // CUSTOM
  {
    selfParaId: 0,
    oakParaId: 0,
    oakEndpoint: '',
    oakSS58Prefix: 0,
  },
  // ROCSTAR
  {
    selfParaId: 2006,
    oakParaId: 2114,
    oakEndpoint: 'wss://rpc.turing-staging.oak.tech',
    oakSS58Prefix: 42,
  },
];
