import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCDsAhQ569VS3i4twuGJGoyevA-cTx9iwg",
  authDomain: "beem-guard.firebaseapp.com",
  databaseURL: "https://beem-guard-default-rtdb.firebaseio.com",
  projectId: "beem-guard",
  storageBucket: "beem-guard.firebasestorage.app",
  messagingSenderId: "662346829118",
  appId: "1:662346829118:web:ab839f40e97faf7023b06f",
  measurementId: "G-5TRET6B1GT"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
