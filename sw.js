// Merk2: guarda la app en el teléfono para usarla sin internet.
// Al publicar cambios, sube VERSION para que el teléfono descargue la versión nueva.
const VERSION='merk2-v2';
const FILES=["./","index.html","manifest.webmanifest","icons/apple-touch-icon.png","icons/favicon.png","icons/icon-192.png","icons/icon-512.png","icons/maskable-512.png"];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>!k.startsWith(VERSION)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  if(url.origin===location.origin){
    if(e.request.mode==='navigate'){
      e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(VERSION).then(c=>c.put('index.html',cp));return r})
        .catch(()=>caches.match('index.html')));
      return;
    }
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
    return;
  }
  if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.open(VERSION+'-fonts').then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(res=>{c.put(e.request,res.clone());return res}))));
  }
});
