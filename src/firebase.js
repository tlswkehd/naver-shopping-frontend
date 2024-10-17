// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase 프로젝트 설정 정보로 대체하세요
const firebaseConfig = {
  apiKey: "AIzaSyBLy_KiBcq1Kwtf6nLqC6bBLgkUuWMXd34",
  authDomain: "aaaa-895ab.firebaseapp.com",
  projectId: "aaaa-895ab",
  storageBucket: "aaaa-895ab.appspot.com",
  messagingSenderId: "1083076033152",
  appId: "1:1083076033152:web:7c5b6780dd0b24c2148465",
  measurementId: "G-CW22QNXK17"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { auth };
export default app;
