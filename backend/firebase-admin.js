const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  }),
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
});

const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();

module.exports = { admin, db, auth, bucket };
