import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
//import { getAnalytics } from "firebase/analytics";

let config = {
    apiKey: "AIzaSyB4MLUPjQQ4gFN2ar3z8jMI1v54hE9T63c",
    authDomain: "vm-planning-poker.firebaseapp.com",
    projectId: "vm-planning-poker",
    storageBucket: "vm-planning-poker.appspot.com",
    messagingSenderId: "514832060871",
    appId: "1:514832060871:web:b2bacc95c80de08c5149e2",
    measurementId: "G-4CCJ482BP5"
};

initializeApp(config);

//export const analytics = getAnalytics(app);
const db = getFirestore();
export default db;