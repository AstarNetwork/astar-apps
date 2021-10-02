import express from 'express';
import { uiRouter } from './routes/ui';
import { storeRouter } from './routes/store';

const app = express();
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use('/api/store', storeRouter);
app.use('/', uiRouter);

const listenPort = process.env.PORT || 30000;

app.listen(listenPort, () => {
  console.log('Server is listening on port ', listenPort);
});