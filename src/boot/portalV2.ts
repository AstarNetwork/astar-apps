import { computed } from 'vue';
import { boot } from 'quasar/wrappers';
import buildDependencyContainer from 'src/v2/app.container';
import { endpointKey } from 'src/config/chainEndpoints';
import { getXcmChainObj, getXcmToken } from 'src/modules/xcm';
import { getXcmTokens } from 'src/modules/xcm/tokens';

export default boot(async ({ store }) => {
  const networkIdx = computed(() => store.getters['general/networkIdx']);
  const network = <endpointKey>networkIdx.value;

  await getXcmChainObj();
  await getXcmTokens();
  buildDependencyContainer(network);
});
