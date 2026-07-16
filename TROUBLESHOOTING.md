# Expedition 11 — Troubleshooting

The game runs **fully offline** by design. Firebase is only used for the
shared leaderboard and the educator reports panel. If Firebase is down or
misconfigured, students never see a broken screen — the app switches to
"Offline mode" and queues any writes for the next successful connection.

Below are the errors most likely to appear in the browser console
(**F12 → Console**) and how to fix each one.

---

## 1. `FIREBASE FATAL ERROR: Cannot parse Firebase url`

**Cause:** `firebaseConfig.databaseURL` is missing, empty, or still a
placeholder like `__FIREBASE_DATABASE_URL__` (from an older CI/CD setup).

**Fix:**
1. Open `firebase-config.js` and confirm `databaseURL` is a real URL like
   `https://expedition-11-3c997-default-rtdb.firebaseio.com`.
2. Confirm both `index.html` and `educator_control_panel.html` load it:
   ```html
   <script src="firebase-config.js"></script>
   ```
   BEFORE the `<script>` that calls `firebase.initializeApp(...)`.
3. Hard-refresh the deployed page (Ctrl+Shift+R) — GitHub Pages caches
   aggressively.

The bundled runtime validator now catches this before it becomes a FATAL
error; the app just shows "Offline mode" instead.

---

## 2. Reports never appear on the educator panel

**Cause:** almost always Realtime Database Rules blocking writes.

**Fix:** In the Firebase console → **Realtime Database → Rules**, publish
this safe starter ruleset (anyone can read leaderboard/reports, anyone can
add a report, only new entries can be created — nothing can be edited or
deleted from the client):

```json
{
  "rules": {
    "leaderboard": {
      ".read": true,
      "$uid": {
        ".write": "!data.exists() || newData.child('uid').val() === $uid",
        ".validate": "newData.hasChildren(['uid','username','xp','timestamp'])"
      }
    },
    "reports": {
      ".read": true,
      "$id": {
        ".write": "!data.exists()"
      }
    }
  }
}
```

For a stricter educator-only edit/delete flow, add Firebase Auth and
scope writes to admin UIDs.

---

## 3. Console spam: `Tracking Prevention blocked access to storage for https://cdn.jsdelivr.net/...`

**Harmless.** This is Edge/Brave's privacy setting blocking MathJax's CDN
from writing its own cache. Math still renders. No action needed.

---

## 4. Realtime DB URL region mismatch

If Firebase created your database in a non-US region, the URL suffix is
`.firebasedatabase.app` (e.g. `https://your-project-default-rtdb.europe-west1.firebasedatabase.app`),
NOT `.firebaseio.com`. Copy the exact URL from the Firebase console →
Realtime Database → Data tab into `firebase-config.js`.

---

## 5. Free-tier project got paused

Firebase Spark (free tier) projects are paused after long inactivity.
Sign in to the Firebase console; opening the project reactivates it
immediately. No plan upgrade needed for this game's expected load.

---

## Getting help fast

Both pages now show a small **"Copy diagnostic info"** button in the
bottom-right corner whenever the app is in offline mode. Click it, paste
the result into your bug report — it contains the config state, last
Firebase error, and how many writes are queued locally.
