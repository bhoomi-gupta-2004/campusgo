// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyB_NFXZop-Vb2jHMZHr8ZnpzNjxgn5zno0",
  authDomain: "campusgo-b2655.firebaseapp.com",
  projectId: "campusgo-b2655",
  storageBucket: "campusgo-b2655.firebasestorage.app",
  messagingSenderId: "366258393437",
  appId: "1:366258393437:web:9ddb734e8d2453c15358b4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getFirestore(app);
export{auth,db};