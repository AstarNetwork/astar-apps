import { computed } from 'vue';
import { boot } from 'quasar/wrappers';
import buildDependencyContainer from 'src/v2/app.container';
import { endpointKey } from 'src/config/chainEndpoints';

export default boot(({ store }) => {
  const networkIdx = computed(() => store.getters['general/networkIdx']);
  const network = <endpointKey>networkIdx.value;

  buildDependencyContainer(network);
});
