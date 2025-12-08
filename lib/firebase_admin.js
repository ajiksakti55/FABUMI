import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
      client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
      ),
    }),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
