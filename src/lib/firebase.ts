import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Inicializa o Firebase App com a configuração do projeto
export const app = initializeApp(firebaseConfig);

// Inicializa o Firestore com o ID específico do banco de dados provisionado
export const dbFirestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Inicializa o Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
