import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore/lite';
import axios from 'axios';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { DappItem, NewDappItem } from 'src/store/dapp-staking/state';
import { TOKEN_API_URL } from 'src/modules/token-api';

// firebase init - add your own config here
const firebaseConfig = {
  apiKey: 'AIzaSyBS6tU69xQAnfWfI4U9vmErJ7qBDnO7MOI',
  authDomain: 'astarnetwork-a4924.firebaseapp.com',
  databaseURL: '',
  projectId: 'astarnetwork-a4924',
  storageBucket: 'gs://astarnetwork-a4924.appspot.com',
  messagingSenderId: '',
  appId: '',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage();
const auth = getAuth(app);
signInAnonymously(auth)
  .then(() => {
    console.info('Firebase user signed in.');
  })
  .catch((error) => {
    console.error(error.message);
  });

const getDapps = async (network: string): Promise<DappItem> => {
  const dappsUrl = `${TOKEN_API_URL}/v1/${network}/dapps-staking/dapps`;
  const result = await axios.get<DappItem>(dappsUrl);

  return result.data;
};

const addDapp = async (collectionName: string, dapp: NewDappItem): Promise<DappItem> => {
  const newDapp = {
    name: dapp.name,
    description: dapp.description,
    address: dapp.address,
    url: dapp.url,
    iconUrl: dapp.iconUrl,
    license: dapp.license,
    videoUrl: dapp.videoUrl ?? '',
    tags: dapp.tags,
    forumUrl: dapp.forumUrl,
    authorContact: dapp.authorContact,
    gitHubUrl: dapp.gitHubUrl,
    imagesUrl: dapp.imagesUrl,
  } as DappItem;

  await setDoc(doc(db, collectionName, newDapp.address), newDapp);

  return newDapp;
};

const uploadFile = async (fileName: string, collectionKey: string, base64Content: string) => {
  const imagesRef = ref(storage, `${collectionKey}/${fileName}`);
  const result = await uploadString(imagesRef, base64Content, 'data_url');
  const url = await getDownloadURL(ref(storage, result.metadata.fullPath));

  return url;
};

// export utils/refs
export { db, getDocs, setDoc, doc, uploadFile, addDapp, getDapps };
