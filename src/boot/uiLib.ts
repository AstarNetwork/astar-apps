import { boot } from 'quasar/wrappers';
import uilib from 'astar-ui';
import 'astar-ui/dist/style.css';

export default boot(({ app }) => {
  // Set astar-ui instance on app
  app.use(uilib);
});
