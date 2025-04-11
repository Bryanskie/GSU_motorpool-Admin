// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// Firebase config from your Firebase console
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID",
// };

const firebaseConfig = {
    apiKey: "AIzaSyCwq0zVxQwKl52vniygq8zaHQQPbnEblWA",
    authDomain: "capstone-e3d93.firebaseapp.com",
    databaseURL: "https://capstone-e3d93-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "capstone-e3d93",
    storageBucket: "capstone-e3d93.firebasestorage.app",
    messagingSenderId: "731878813259",
    appId: "1:731878813259:web:31e90e28c15c4b2ab5e7ce"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export { app };
