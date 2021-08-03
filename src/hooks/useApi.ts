import { usePolkadotContainerContext } from 'src/config/api/polkadot';

/**
 * Access the global polkadot API state that is provided by the provider component from a nested parent
 */
export const useApi = () => {
  const { api, extensions } = usePolkadotContainerContext();

  return { api, extensions };
};
