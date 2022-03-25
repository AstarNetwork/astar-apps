import { boot } from 'quasar/wrappers';
import uilib from '@astar-network/astar-ui';
import '@astar-network/astar-ui/dist/style.css';

export default boot(({ app }) => {
  // Set astar-ui instance on app
  app.use(uilib);
});
