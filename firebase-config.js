// ============================================================================
// Shared Firebase config for Expedition 11.
//
// Loaded by BOTH index.html (student app) and educator_control_panel.html
// (teacher dashboard) — so they can never talk to two different backends.
//
// These values are SAFE to commit. Firebase client config is not a secret;
// access is enforced by Realtime Database Rules in the Firebase console,
// not by hiding these fields.
//
// ─── If the app suddenly shows "Local only" ─── check these 3 things:
//   1. Firebase console → Realtime Database is enabled (not just Firestore).
//   2. Database Rules published (see TROUBLESHOOTING.md for a safe starter).
//   3. `databaseURL` below still matches the URL shown in the Firebase
//      console → Realtime Database → Data tab (region suffix matters:
//      US → `.firebaseio.com`, others → `.<region>.firebasedatabase.app`).
// ============================================================================

const firebaseConfig = {
  apiKey: "AIzaSyDUr5QPsUNk9VaixxwqsDESwXcvzqLxYSE",
  authDomain: "expedition-11-3c997.firebaseapp.com",
  databaseURL: "https://expedition-11-3c997-default-rtdb.firebaseio.com",
  projectId: "expedition-11-3c997",
  storageBucket: "expedition-11-3c997.firebasestorage.app",
  messagingSenderId: "935443179328",
  appId: "1:935443179328:web:792506ecaa0d2728383ca5",
  measurementId: "G-Y83G37CK8N"
};


// ─── Runtime sanity check ──────────────────────────────────────────────────
// Called by index.html / educator_control_panel.html before firebase.initializeApp
// so a bad config produces a friendly offline mode instead of a FATAL error.
window.__validateFirebaseConfig = function (cfg) {
  if (!cfg || typeof cfg !== 'object') return 'firebaseConfig missing (firebase-config.js not loaded?)';
  const url = cfg.databaseURL || '';
  if (typeof url !== 'string' || !url.startsWith('https://'))
    return 'databaseURL is missing or not an https:// URL';
  if (url.includes('__') || url.includes('YOUR_'))
    return 'databaseURL still contains a placeholder — edit firebase-config.js';
  if (!(url.endsWith('.firebaseio.com') || url.endsWith('.firebasedatabase.app')))
    return 'databaseURL region suffix looks wrong (expected .firebaseio.com or .firebasedatabase.app)';
  if (!cfg.apiKey || !cfg.projectId) return 'apiKey or projectId missing';
  return null; // null = OK
};
