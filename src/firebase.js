// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            'AIzaSyC64BavcA4h7HC3kY7THCsf979jimtan44',
  authDomain:        'rakshyanetra01.firebaseapp.com',
  projectId:         'rakshyanetra01',
  storageBucket:     'rakshyanetra01.firebasestorage.app',
  messagingSenderId: '926527176698',
  appId:             '1:926527176698:web:20923e6529702ea571ae43',
  measurementId:     'G-2F5LG5BDDS',
  databaseURL:       'https://rakshyanetra01-default-rtdb.firebaseio.com',
};

const app      = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
