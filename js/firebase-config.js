// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBzJ_sOCdnorb6p6aQdPnuBPA25SKMX15o",
  authDomain: "yuicode1-aa0bb.firebaseapp.com",
  projectId: "yuicode1-aa0bb",
  storageBucket: "yuicode1-aa0bb.firebasestorage.app",
  messagingSenderId: "364868842975",
  appId: "1:364868842975:web:579d58814bf97adc9f006a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };