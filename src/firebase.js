import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDlCssBBBDIfJipqPOWNbDT9l5MmerDwSM",
  authDomain: "nano-apps-net.firebaseapp.com",
  projectId: "nano-apps-net",
  storageBucket: "nano-apps-net.firebasestorage.app",
  messagingSenderId: "532773409178",
  appId: "1:532773409178:web:5bf9db2a1949021abfaa23",
  measurementId: "G-XTHVJ7K0H4"
};

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

const db = getFirestore();
export default db;