import { endpointKey } from 'src/config/chainEndpoints';

export const xcmToken = {
  [endpointKey.ASTAR]: [],
  [endpointKey.SHIDEN]: [
    {
      symbol: 'KSM',
      logo: require('/src/assets/img/ic_kusama.png'),
    },
  ],
  [endpointKey.SHIBUYA]: [],
};
