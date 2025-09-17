// Agrolinx Service Worker v1.0.0
// Solución inmediata para error 404 + funcionalidades PWA básicas

const CACHE_VERSION = 'v1';
const CACHE_NAMES = {
  STATIC: `agrolinx-static-${CACHE_VERSION}`,
  IMAGES: `agrolinx-images-${CACHE_VERSION}`,
  PAGES: `agrolinx-pages-${CACHE_VERSION}`
};

// Recursos críticos para precache
const PRECACHE_URLS = [
  '/',
  '/styles/header-footer-styles.css',
  '/styles/sections-styles.css',
  '/scripts/critical-minimal.js',
  '/scripts/module-loader.js',
  '/imag/logodar.webp',
  '/imag/icon.ico'
];

// ========================================
// INSTALL EVENT - Precache recursos críticos
// ========================================
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker v1.0.0');
  
  event.waitUntil(
    caches.open(CACHE_NAMES.STATIC)
      .then(cache => {
        console.log('[SW] Precaching critical resources');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting(); // Activar inmediatamente
      })
      .catch(error => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// ========================================
// ACTIVATE EVENT - Limpiar caches antiguos
// ========================================
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker v1.0.0');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        const deletePromises = cacheNames
          .filter(cacheName => {
            // Eliminar caches que no sean de la versión actual
            return !Object.values(CACHE_NAMES).includes(cacheName);
          })
          .map(cacheName => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          });
        
        return Promise.all(deletePromises);
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim(); // Tomar control inmediatamente
      })
      .catch(error => {
        console.error('[SW] Activation failed:', error);
      })
  );
});

// ========================================
// FETCH EVENT - Interceptar requests
// ========================================
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo manejar requests del mismo origen
  if (url.origin !== location.origin) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

// ========================================
// ESTRATEGIAS DE CACHE
// ========================================
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Estrategia por tipo de recurso
    if (isStaticAsset(url.pathname)) {
      return await cacheFirst(request, CACHE_NAMES.STATIC);
    } else if (isImage(url.pathname)) {
      return await staleWhileRevalidate(request, CACHE_NAMES.IMAGES);
    } else if (isNavigationRequest(request)) {
      return await networkFirst(request, CACHE_NAMES.PAGES);
    } else {
      // Default: intentar red primero
      return await fetch(request);
    }
  } catch (error) {
    console.error('[SW] Request failed:', error);
    
    // Fallback para navegación
    if (isNavigationRequest(request)) {
      const cachedPage = await caches.match('/');
      if (cachedPage) {
        return cachedPage;
      }
    }
    
    // Fallback genérico
    return new Response('Recurso no disponible offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Cache First - Para recursos estáticos (CSS, JS, fuentes)
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  const cache = await caches.open(cacheName);
  cache.put(request, networkResponse.clone());
  
  return networkResponse;
}

// Network First - Para páginas HTML
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale While Revalidate - Para imágenes
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    const cache = caches.open(cacheName);
    cache.then(c => c.put(request, networkResponse.clone()));
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// ========================================
// UTILIDADES
// ========================================
function isStaticAsset(pathname) {
  return /\.(css|js|woff|woff2|ttf|eot)$/i.test(pathname);
}

function isImage(pathname) {
  return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(pathname);
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// ========================================
// MESSAGE HANDLING - Para comunicación con la página
// ========================================
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker loaded successfully ✅');