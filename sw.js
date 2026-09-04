/* Service worker: hanya meng-cache shell
aplikasi.
Panggilan ke Apps Script (POST) TIDAK
boleh di-cache — dilewatkan apa adanya. */
const CACHE = "fd26-checkin-v4"; //
naikkan versi ini setiap kali scanner.html
diubah
const SHELL = [
"./",
"./scanner.html",
"./jsQR.js",
"./Logo_EATON.png",
"./manifest.json"
];
self.addEventListener("install", e=>{
e.waitUntil(
caches.open(CACHE)
// addAll gagal total bila satu file
hilang; tambahkan satu per satu
.then(c => Promise.all(SHELL.map(u =>
c.add(u).catch(()=>{}))))
.then(()=>self.skipWaiting())
);
});
self.addEventListener("activate", e=>{
e.waitUntil(
caches.keys()
.then(ks =>
Promise.all(ks.filter(k=>k!==CACHE).map(k=>
caches.delete(k))))
.then(()=>self.clients.claim())
);
});
self.addEventListener("fetch", e=>{
const req = e.request;
// Jangan sentuh apa pun selain GET, dan
jangan sentuh Apps Script.
if(req.method !== "GET") return;
if(req.url.indexOf("script.google.com")
!== -1) return;
if(req.url.indexOf("script.googleuserconten
t.com") !== -1) return;
// Shell: cache dulu supaya buka instan
walau sinyal jelek,
// sambil memperbarui cache di belakang.
e.respondWith(
caches.match(req).then(hit=>{
const fresh = fetch(req).then(res=>{
if(res && res.ok){
const copy = res.clone();
caches.open(CACHE).then(c=>c.put(req,
copy)).catch(()=>{});
}
return res;
}).catch(()=> hit);
return hit || fresh;
})
);
});
