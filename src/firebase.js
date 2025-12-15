import { getApp, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
//import { getAnalytics } from "firebase/analytics";

let config = {
  apiKey: "AIzaSyDlCssBBBDIfJipqPOWNbDT9l5MmerDwSM",
  authDomain: "nano-apps-net.firebaseapp.com",
  databaseURL: "https://nano-apps-net-default-rtdb.firebaseio.com",
  projectId: "nano-apps-net",
  storageBucket: "nano-apps-net.firebasestorage.app",
  messagingSenderId: "532773409178",
  appId: "1:532773409178:web:5bf9db2a1949021abfaa23",
  measurementId: "G-XTHVJ7K0H4"
};

initializeApp(config);

console.log("client projectId:", getApp().options.projectId);


//export const analytics = getAnalytics(app);
const db = getFirestore();
export default db;