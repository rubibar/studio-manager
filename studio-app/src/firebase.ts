import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyC-9uit_eC83a2OjzVLkJbSNF4omX7ZUyI",
  authDomain: "replica-dashboard-52a64.firebaseapp.com",
  databaseURL: "https://replica-dashboard-52a64-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "replica-dashboard-52a64",
  storageBucket: "replica-dashboard-52a64.firebasestorage.app",
  messagingSenderId: "506950396387",
  appId: "1:506950396387:web:47d580b6c178403131d8d6"
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getDatabase(app)
export const googleProvider = new GoogleAuthProvider()
