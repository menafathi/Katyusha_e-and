const CACHE_NAME = 'v30'; // غير الرقم كل ما تعدل حاجة
const urlsToCache = [
  './',
  './index.html'
];

// عند تثبيت الـ SW
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching new files...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // لتفعيل النسخة الجديدة فورًا
});

// عند تفعيل الـ SW
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Removing old cache:', key);
            return caches.delete(key); // حذف الكاش القديم
          }
        })
      );
    })
  );
  self.clients.claim(); // لتفعيل النسخة الجديدة على الصفحات المفتوحة
});

// عند جلب أي طلب
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      if (res) {
        // إذا وجدنا نسخة في الكاش، نرجعها ولكن نحاول تحديث الكاش بالخلفية
        fetch(e.request).then(fetchRes => {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, fetchRes.clone()); // تحديث الكاش
          });
        });
        return res; // إرجاع النسخة من الكاش
      } else {
        // إذا لم نجد الكاش، نطلبها من الشبكة
        return fetch(e.request).then(fetchRes => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, fetchRes.clone()); // إضافة النسخة الجديدة إلى الكاش
            return fetchRes;
          });
        });
      }
    })
  );
});

// لحظة إضافة التحديث التلقائي للنسخة الجديدة (خاص بجعل SW يعمل تلقائيًا)
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') {
    self.skipWaiting(); // تخطي الانتظار للنسخة الجديدة
  }
});
