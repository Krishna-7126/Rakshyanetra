// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();
const REMEMBER_ME_EXPIRY_KEY = 'remember_me_expiry';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const expiry = Number(localStorage.getItem(REMEMBER_ME_EXPIRY_KEY));
      if (expiry && Date.now() > expiry) {
        await signOut(auth);
        localStorage.removeItem(REMEMBER_ME_EXPIRY_KEY);
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const setExpiry = (remember) => {
    if (remember) {
      localStorage.setItem(REMEMBER_ME_EXPIRY_KEY, String(Date.now() + 30 * 24 * 60 * 60 * 1000));
    } else {
      localStorage.removeItem(REMEMBER_ME_EXPIRY_KEY);
    }
  };

  const signup = async (email, password, remember = false) => {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    const credentials = await createUserWithEmailAndPassword(auth, email, password);
    setExpiry(remember);
    return credentials;
  };

  const login = async (email, password, remember = false) => {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    const credentials = await signInWithEmailAndPassword(auth, email, password);
    setExpiry(remember);
    return credentials;
  };

  const loginWithGoogle = async (remember = false) => {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    const provider = new GoogleAuthProvider();
    const credentials = await signInWithPopup(auth, provider);
    setExpiry(remember);
    return credentials;
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    localStorage.removeItem(REMEMBER_ME_EXPIRY_KEY);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, loginWithGoogle, resetPassword, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}