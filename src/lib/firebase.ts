/*
 * Este produto/código é de propriedade intelectual exclusiva de José Jacinto, criador e desenvolvedor do projeto.
 */

// ============================================================================
//  FIREBASE — Configuração única e oficial do backend da FILDA II.
//  Fonte da configuração:
//    1) Variáveis de ambiente VITE_FIREBASE_* (Netlify / .env)
//    2) Fallback para firebase-applet-config.json (mesmo projeto Firebase)
//  Nunca colocar aqui service accounts nem chaves privadas.
// ============================================================================

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInAnonymously } from "firebase/auth";
import { getStorage } from "firebase/storage";
import configLocal from "../../firebase-applet-config.json";

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env["VITE_FIREBASE_API_KEY"] || configLocal.apiKey,
  authDomain: env["VITE_FIREBASE_AUTH_DOMAIN"] || configLocal.authDomain,
  projectId: env["VITE_FIREBASE_PROJECT_ID"] || configLocal.projectId,
  storageBucket: env["VITE_FIREBASE_STORAGE_BUCKET"] || configLocal.storageBucket,
  messagingSenderId: env["VITE_FIREBASE_MESSAGING_SENDER_ID"] || configLocal.messagingSenderId,
  appId: env["VITE_FIREBASE_APP_ID"] || configLocal.appId,
};

// Evita reinicializar o app durante HMR / SSR
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firestore — banco de dados oficial
export const dbFirestore = getFirestore(
  app,
  (configLocal as { firestoreDatabaseId?: string }).firestoreDatabaseId ?? "(default)",
);

// Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Cloud Storage — armazenamento oficial de imagens
export const storage = getStorage(app);

/**
 * Garante que existe sempre uma sessão Firebase (mesmo para visitantes),
 * para que as regras de segurança possam distinguir visitante de utilizador
 * e nunca seja necessário abrir o Firestore a pedidos totalmente anónimos.
 * Requer "Anonymous" activado em Firebase Authentication > Sign-in method.
 */
export async function garantirSessaoFirebase() {
  if (typeof window === "undefined") return null;
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn("Sessão anónima indisponível (verifique o método Anónimo no Firebase):", err);
    return null;
  }
}
