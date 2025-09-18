const CACHE_VERSION = "v2"
const CACHE_NAMES = {
  STATIC: `agrolinx-static-${CACHE_VERSION}`,
  IMAGES: `agrolinx-images-${CACHE_VERSION}`,
  PAGES: `agrolinx-pages-${CACHE_VERSION}`,
}

// Recursos críticos para precache - Solo recursos que realmente se usan
const PRECACHE_URLS = [
  '/', // Página principal
  '/styles/header-footer-styles.css', // CSS crítico
  '/styles/sections-styles.css', // CSS crítico
  '/imag/logodar.webp', // Logo principal
  '/imag/icon.ico' // Favicon
];

// Recursos de segunda prioridad (se cargan después)
const SECONDARY_CACHE_URLS = [
  '/scripts/module-loader.js', // Se carga dinámicamente
  '/scripts/gallery-module.js', // Módulo de galería
  '/scripts/form-module.js' // Módulo de formulario
];

// ========================================
// INSTALL EVENT - Precache recursos críticos
// ========================================
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker v1.0.0');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAMES.STATIC);
      
      // 1. Cachear recursos críticos PRIMERO (reduce cadenas críticas)
      console.log('[SW] Caching critical resources first...');
      const criticalPromises = PRECACHE_URLS.map(async url => {
        try {
          const response = await fetch(url);
          if (response.status === 200) {
            await cache.put(url, response);
            console.log(`[SW] ✅ Critical cached: ${url}`);
          } else {
            console.warn(`[SW] ⚠️ Failed to cache critical ${url}: ${response.status}`);
          }
        } catch (error) {
          console.warn(`[SW] ❌ Error caching critical ${url}:`, error.message);
        }
      });
      
      await Promise.allSettled(criticalPromises);
      console.log('[SW] Critical resources cached');
      
      // 2. Cachear recursos secundarios en background (no bloquea)
      setTimeout(async () => {
        console.log('[SW] Caching secondary resources...');
        const secondaryPromises = SECONDARY_CACHE_URLS.map(async url => {
          try {
            const response = await fetch(url);
            if (response.status === 200) {
              await cache.put(url, response);
              console.log(`[SW] 📦 Secondary cached: ${url}`);
            }
          } catch (error) {
            console.warn(`[SW] Secondary cache error for ${url}:`, error.message);
          }
        });
        
        await Promise.allSettled(secondaryPromises);
        console.log('[SW] Secondary resources cached');
      }, 1000); // Delay para no bloquear recursos críticos
      
      console.log('[SW] Installation complete');
      return self.skipWaiting();
    })().catch(error => {
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
    caches
      .keys()
      .then((cacheNames) => {
        const deletePromises = cacheNames
          .filter((cacheName) => !Object.values(CACHE_NAMES).includes(cacheName))
          .map((cacheName) => {
            console.log("[SW] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          })

        return Promise.all(deletePromises)
      })
      .then(() => {
        console.log("[SW] Activation complete")
        return self.clients.claim()
      }),
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin requests
  if (url.origin !== location.origin) return

  event.respondWith(handleRequest(request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  try {
    if (isImage(url.pathname)) {
      return await imageFirst(request, CACHE_NAMES.IMAGES)
    } else if (isStaticAsset(url.pathname)) {
      return await cacheFirst(request, CACHE_NAMES.STATIC)
    } else if (isNavigationRequest(request)) {
      return await networkFirst(request, CACHE_NAMES.PAGES)
    } else {
      return await fetch(request)
    }
  } catch (error) {
    console.error("[SW] Request failed:", error)

    if (isNavigationRequest(request)) {
      const cachedPage = await caches.match("/")
      if (cachedPage) return cachedPage
    }

    return new Response("Recurso no disponible offline", {
      status: 503,
      statusText: "Service Unavailable",
    })
  }
}

async function imageFirst(request, cacheName) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) return cachedResponse

  try {
    const networkResponse = await fetch(request)

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName)
      // Only cache successful image responses
      if (networkResponse.headers.get("content-type")?.startsWith("image/")) {
        cache.put(request, networkResponse.clone())
      }
    }

    return networkResponse
  } catch (error) {
    console.error("[SW] Image fetch failed:", error)
    throw error
  }
}

// Cache first strategy for static assets
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) return cachedResponse

  try {
    const networkResponse = await fetch(request)

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.error("[SW] Cache first failed:", error)
    throw error
  }
}

// Network first strategy for pages
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request)

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log("[SW] Network failed, trying cache:", error.message)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) return cachedResponse
    throw error
  }
}

// Utility functions
function isStaticAsset(pathname) {
  return /\.(css|js|woff|woff2|ttf|eot)$/i.test(pathname)
}

function isImage(pathname) {
  return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(pathname)
}

function isNavigationRequest(request) {
  return (
    request.mode === "navigate" || (request.method === "GET" && request.headers.get("accept")?.includes("text/html"))
  )
}

// Message handling
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

console.log("[SW] Service Worker v2.0.0 loaded successfully ✅")
