import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBS2gVyItYPtvpc5LvOP9szI7eXg6lFNy0",
    authDomain: "desarrollo-en-la-nube-61b27.firebaseapp.com",
    projectId: "desarrollo-en-la-nube-61b27",
    storageBucket: "desarrollo-en-la-nube-61b27.firebasestorage.app",
    messagingSenderId: "104353743332",
    appId: "1:104353743332:web:7a87a0102d47e566b087f1",
    measurementId: "G-BDCQKD60LF"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);