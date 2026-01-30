import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCp96kJUdQurGtjffPpnznneMjxYGwdmxM",
  authDomain: "im-ironman02.firebaseapp.com",
  projectId: "im-ironman02",
  storageBucket: "im-ironman02.firebasestorage.app",
  messagingSenderId: "636155353146",
  appId: "1:636155353146:web:99b02ca7a27282e6827d03"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
