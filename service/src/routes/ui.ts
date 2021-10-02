// All other GET requests will return the Astar portal
import express, { Request, Response } from 'express';
const path = require('path');
const router = express.Router();
const clientPath = '../../../dist/spa';

// Have Node serve the files for the portal.
router.use(express.static(path.resolve(__dirname, clientPath)));

router.get('*', (req: Request, res:Response) => {
  console.log('get', path.resolve(__dirname, clientPath, 'index.html'));
  res.sendFile(path.resolve(__dirname, clientPath, 'index.html'));
});

export { router as uiRouter };