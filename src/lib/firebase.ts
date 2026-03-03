// Firebase configuration placeholder
// Will be configured when Firebase is set up

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

export const isFirebaseConfigured = () => {
  return !!(firebaseConfig.apiKey && firebaseConfig.databaseURL);
};

// Initialize Firebase (if configured)
let db: any = null;

export const getDatabase = async () => {
  if (!isFirebaseConfigured()) {
    console.warn("Firebase not configured, using localStorage fallback");
    return null;
  }

  if (db) return db;

  try {
    // These imports will only work when Firebase is installed
    // For now, they're optional and will fallback to localStorage
    // @ts-ignore - Firebase may not be installed yet
    const { initializeApp } = await import("firebase/app");
    // @ts-ignore - Firebase may not be installed yet
    const { getDatabase: getRealtimeDb } = await import("firebase/database");

    const app = initializeApp(firebaseConfig);
    db = getRealtimeDb(app);
    return db;
  } catch (error) {
    console.warn("Firebase not available, using localStorage fallback:", error);
    return null;
  }
};
