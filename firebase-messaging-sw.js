// Expedition 11 — background push notification handler.
//
// This is a SEPARATE service worker from sw.js (the app-shell/offline
// cache one) because Firebase Cloud Messaging's web SDK specifically looks
// for a service worker registered to handle background push events; it's
// registered on demand from enableNotifications() in index.html, only
// after the user has actually granted notification permission — it is
// NOT auto-registered on every visit like sw.js is.
//
// Requires firebase-config.js (same file index.html already loads) to sit
// alongside this file at the site root, since it's the source of
// firebaseConfig used below.

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
importScripts('/firebase-config.js');

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Fired when a push arrives while the app is closed or the tab isn't
// focused. (Foreground messages, app open + focused, are instead handled
// by the onMessage() listener in index.html, which shows an in-app toast
// instead of a native OS notification — that's the standard FCM pattern.)
messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || 'Expedition 11';
  const options = {
    body: (payload.notification && payload.notification.body) || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});

// Clicking the notification focuses an existing tab if one's open,
// otherwise opens a new one, rather than always spawning a new tab.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
