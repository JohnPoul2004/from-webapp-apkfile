import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, setLogLevel } from 'firebase/firestore';

// Silence Firestore internal transient connection retry logs in sandbox/iframe environments
setLogLevel('silent');

const firebaseConfig = {
  apiKey: "AIzaSyADyM8XtP94xkndi4noighfIqjyQpstTqU",
  authDomain: "dmm-network-acaf1.firebaseapp.com",
  projectId: "dmm-network-acaf1",
  storageBucket: "dmm-network-acaf1.firebasestorage.app",
  messagingSenderId: "112654507993",
  appId: "1:112654507993:web:87c550e09d65924c6903c8",
  measurementId: "G-L91EJPTTSD"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties: true
});
export default app;

