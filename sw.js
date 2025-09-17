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
      .then(async cache => {
        console.log('[SW] Precaching critical resources');
        
        // Precachear recursos uno por uno para mejor manejo de errores
        const cachePromises = PRECACHE_URLS.map(async url => {
          try {
            const response = await fetch(url);
            if (response.status === 200) {
              await cache.put(url, response);
              console.log(`[SW] Cached: ${url}`);
            } else {
              console.warn(`[SW] Failed to cache ${url}: ${response.status}`);
            }
          } catch (error) {
            console.warn(`[SW] Error caching ${url}:`, error.message);
          }
        });
        
        await Promise.allSettled(cachePromises);
        return true;
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
  
  try {
    const networkResponse = await fetch(request);
    
    // Solo cachear si la respuesta es válida
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      // Clonar ANTES de usar la respuesta
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache First failed:', error);
    throw error;
  }
}

// Network First - Para páginas HTML
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    // Solo cachear respuestas exitosas
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      // Clonar ANTES de retornar
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error.message);
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
  
  // Actualizar cache en background
  const fetchPromise = fetch(request)
    .then(async networkResponse => {
      if (networkResponse && networkResponse.status === 200) {
        const cache = await caches.open(cacheName);
        // Clonar para el cache
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(error => {
      console.log('[SW] Background fetch failed:', error.message);
      return null;
    });
  
  // Si hay cache, devolverlo inmediatamente
  if (cachedResponse) {
    // Ejecutar fetch en background sin esperar
    fetchPromise;
    return cachedResponse;
  }
  
  // Si no hay cache, esperar el fetch
  return fetchPromise;
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