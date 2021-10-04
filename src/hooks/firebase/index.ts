import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
} from 'firebase/firestore/lite';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { DappItem, NewDappItem } from 'src/store/dapps-store/state';

// firebase init - add your own config here
const firebaseConfig = {
  apiKey: 'AIzaSyA0z54GGpR59uOzb-I4aNDCmvC1S1UO24E',
  authDomain: '',
  databaseURL: '',
  projectId: 'dapp-store-7f9ab',
  storageBucket: 'gs://dapp-store-7f9ab.appspot.com',
  messagingSenderId: '',
  appId: ''
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app);

// collection references
const dappsCollection = collection(db, 'dapps')

const storage = getStorage();


// const getDapps = async ():Promise<DocumentData[]> => {
//   const docs = await getDocs(dappsCollection);
//   return docs.docs.map(x => x.data());
// }

const addDapp = async (dapp: NewDappItem): Promise<DappItem> => {
  const newDapp = {
    name: dapp.name,
    description: dapp.description,
    address: dapp.address,
    url: dapp.url,
    iconUrl: dapp.iconUrl
  } as DappItem

  await setDoc(doc(db, 'dapps', newDapp.address), newDapp);

  return newDapp;
}

const uploadFile = async (fileName: string, base64Content: string) => {
  const imagesRef = ref(storage, `images/${fileName}`);
  const result = await uploadString(imagesRef, base64Content, 'data_url');
  const url = await getDownloadURL(ref(storage, result.metadata.fullPath));

  return url;
}

// export utils/refs
export {
  dappsCollection,
  db,
  getDocs,
  setDoc,
  doc,
  uploadFile,
  addDapp
}