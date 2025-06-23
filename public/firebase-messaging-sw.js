importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBS2gVyItYPtvpc5LvOP9szI7eXg6lFNy0",
    authDomain: "desarrollo-en-la-nube-61b27.firebaseapp.com",
    projectId: "desarrollo-en-la-nube-61b27",
    messagingSenderId: "104353743332",
    appId: "1:104353743332:web:7a87a0102d47e566b087f1"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
