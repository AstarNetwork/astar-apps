import express, { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as admin from 'firebase-admin';

const router = express.Router();

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  //databaseURL: 'https://dapp-store-7f9ab.firebaseapp.com'
  databaseURL: 'https://dapp-store-7f9ab-default-rtdb.europe-west1.firebasedatabase.app/'
});

// TODO move data logic outside the router.
router.get('/', async (req: Request, res: Response) => {
  console.log('getting dapps');
  
  const db = admin.database();
  const ref = db.ref();
  const snapshot = await ref.get();
  const data = await snapshot.val();
  console.log('dapps ', data);
  
  res.send(data);
});

router.post('/register', async (req: Request<TestData>, res:Response, next: NextFunction) => {
  try {
    console.log('registering dapp', req.body);
    const db = admin.database();
    const ref = db.ref();
    const newDappRef = ref.child(`dapps/${req.body.address}`);

    // check if dApp already exists
    const dApp = await newDappRef.get()

    if (!dApp) {
      await newDappRef.set(req.body);
      res.send(req.body)  ;
    } else {
      res.status(StatusCodes.CONFLICT).send(`dApp with address ${req.body.address} is already registered.`);
    }
  } catch(err) {
    next(err);
  }

});

interface TestData {
  name: string;
  description: string;
  address: string;
}


export { router as storeRouter };