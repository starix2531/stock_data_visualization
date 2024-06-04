import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBFBPHOhtu1siGQhgtp9nB6JlxX77BEFN8",
    authDomain: "stock-firebase-v1.firebaseapp.com",
    projectId: "stock-firebase-v1",
    storageBucket:  "stock-firebase-v1.appspot.com",
    messagingSenderId: "95744555465",
    appId: "1:95744555465:web:91f1cc7a5b1ec41176d018"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = getFirestore(app);

export { app, auth, db };


