import { $api } from 'boot/api';
import { boot } from 'quasar/wrappers';
import buildDependencyContainer from 'src/v2/app.container';
import { getProviderIndex } from 'src/config/chainEndpoints';
import { ASTAR_CHAIN } from 'src/config/chain';

export default boot(async () => {
  const systemChain: string = ((await $api!.rpc.system.chain()) || '<unknown>').toString();
  buildDependencyContainer(getProviderIndex(systemChain as ASTAR_CHAIN));
});
