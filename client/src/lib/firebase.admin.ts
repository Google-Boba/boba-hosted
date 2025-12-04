import admin from "firebase-admin";

let adminApp: admin.app.App | null = null;
let adminDbInstance: admin.firestore.Firestore | null = null;

function initializeFirebase(): admin.firestore.Firestore {
  // Only initialize if not already initialized
  if (!adminApp) {
    if (admin.apps.length > 0) {
      adminApp = admin.app();
    } else {
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

      // During build time, if credentials aren't available, return a mock
      // that will throw a helpful error at runtime
      if (!serviceAccountJson) {
        // Return a proxy that throws on access during build
        return new Proxy({} as admin.firestore.Firestore, {
          get() {
            throw new Error("Please try again later.");
          },
        });
      }

      let serviceAccount;
      try {
        serviceAccount = JSON.parse(serviceAccountJson);
      } catch {
        throw new Error("Please try again later.");
      }

      if (!serviceAccount.project_id) {
        throw new Error("Please try again later.");
      }

      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }

  if (!adminDbInstance) {
    adminDbInstance = adminApp.firestore();
  }

  return adminDbInstance;
}

// Lazy initialization - only initializes when first accessed
export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(_target, prop) {
    const db = initializeFirebase();
    const value = db[prop as keyof admin.firestore.Firestore];
    return typeof value === "function" ? value.bind(db) : value;
  },
});
