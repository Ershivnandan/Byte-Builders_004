
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js"; 
import { getDatabase, ref, set, update, push } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";


const firebaseConfig = {
  apiKey: "AIzaSyDRFVvY7YitpjumzUk_5GzHUyjL1xcd2do",
  authDomain: "productivity-suit-31c49.firebaseapp.com",
  projectId: "productivity-suit-31c49",
  storageBucket: "productivity-suit-31c49.firebasestorage.app",
  messagingSenderId: "276122920204",
  appId: "1:276122920204:web:60db9562833c7feb7fd529",
  measurementId: "G-KEBJXF4MGR",
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

const auth = getAuth(app);
export { database, auth };

