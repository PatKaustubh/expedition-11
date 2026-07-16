// ============================================================================
// Shared Firebase config for the Expedition 11 project.
//
// Both index.html (player-facing app) and educator_control_panel.html
// (teacher reports/leaderboard admin panel) load THIS SAME FILE, so they
// always talk to the exact same Firebase project and can never drift out of
// sync with each other again.
//
// These values are safe to commit — Firebase client config is not a secret;
// access is controlled by the Database Rules set in the Firebase console,
// not by hiding these fields. No GitHub Actions injection step needed.
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
