import { boot } from 'quasar/wrappers';
import uilib from '@astar-network/astar-ui';
import '@astar-network/astar-ui/dist/style.css';
import VueClickAway from 'vue3-click-away';

export default boot(({ app }) => {
  // Set astar-ui instance on app
  // @ts-ignore
  app.use(uilib);
  app.use(VueClickAway);
});
