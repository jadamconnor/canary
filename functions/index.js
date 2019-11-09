const functions = require('firebase-functions');
const admin = require('firebase-admin');
const FieldValue = require('firebase-admin').firestore.FieldValue;
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

exports.setEntryCount = functions.firestore
.document('users/{uid}/entries/{date}')
.onWrite((change, context) => {
  const db = admin.firestore();
  const uid = context.params.uid;
  if (!change.before.exists) {
    // New document Created : add one to count

    db.doc(`users/${uid}`).update({
      entryCount: FieldValue.increment(1)
    });

  } else if (change.before.exists && change.after.exists) {
    // Updating existing document : Do nothing

  } else if (!change.after.exists) {
    // Deleting document : subtract one from count

    db.doc(`users/${uid}`).update({
      entryCount: FieldValue.increment(-1)
    });
  }
  return;
});
