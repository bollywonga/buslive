/*
  script.js (module)

  Responsibilities:
  - Initialize Firebase Realtime Database (you must add your firebaseConfig below)
  - Initialize Leaflet map on both pages
  - On index.html: start/stop sharing via geolocation.watchPosition(), update Firebase
  - On view.html: read the `id` URL param and listen to Firebase for live updates, show marker

  Notes for setup (see firebaseConfig below):
  1. Create a Firebase project at https://console.firebase.google.com/
  2. Enable Realtime Database and choose the location.
  3. In "Rules" for quick testing you can set:
     {
       "rules": {
         ".read": true,
         ".write": true
       }
     }
     (BEWARE: This is public read/write. For production, secure with auth and more specific rules.)
  4. Copy your firebaseConfig object and paste it into the firebaseConfig variable below.
*/

// ----- Firebase config placeholder (REPLACE with your project's credentials) -----
// Example structure (replace values):
// const firebaseConfig = {
//   apiKey: "...",
//   authDomain: "...",
//   databaseURL: "https://<your-db-name>.firebaseio.com",
//   projectId: "...",
//   storageBucket: "...",
//   messagingSenderId: "...",
//   appId: "..."
// };

const firebaseConfig = {
    apiKey: "AIzaSyAnDRhdEvaZTPlJr9rmmB7VLn8xUh_E22U",
    authDomain: "buslive-d984a.firebaseapp.com",
    databaseURL: "https://buslive-d984a-default-rtdb.firebaseio.com",
    projectId: "buslive-d984a",
    storageBucket: "buslive-d984a.firebasestorage.app",
    messagingSenderId: "653217528392",
    appId: "1:653217528392:web:da87e353dba5a67c59367d",
    measurementId: "G-RN7XG4R2KF"
};

// ----- Imports from Firebase v9 (modular) via CDN -----
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import {
  getDatabase,
  ref,
  set,
  onValue,
  update,
  get
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';

// Simple helper to check if firebaseConfig is filled
function isFirebaseConfigured() {
  return firebaseConfig && firebaseConfig.apiKey && firebaseConfig.databaseURL;
}

let app = null;
let db = null;

function initFirebaseIfNeeded() {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase config is empty. Please edit script.js and add your firebaseConfig.');
    return false;
  }
  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
  }
  return true;
}

// ----- Utility: generate a short unique id for sharing -----
function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ----- Leaflet map init (returns {map, markerLayer}) -----
function createMap(containerId = 'map') {
  const map = L.map(containerId).setView([20, 0], 2); // world view until we have location
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  const markerLayer = L.layerGroup().addTo(map);
  return { map, markerLayer };
}

// ----- Code for index.html (sharing) -----
async function setupSharePage() {
  const hasFirebase = initFirebaseIfNeeded();
  if (!hasFirebase) {
    // show a warning in console and continue so map still works locally
  }

  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const shareBtn = document.getElementById('shareBtn');

  const { map, markerLayer } = createMap('map');

  let watchId = null;
  let currentId = localStorage.getItem('live_location_id') || null;

  function updateLocalMarker(lat, lng) {
    markerLayer.clearLayers();
    const m = L.marker([lat, lng]).addTo(markerLayer);
    m.bindPopup('You').openPopup();
    map.setView([lat, lng], 16);
  }

  async function sendLocationToFirebase(id, lat, lng) {
    if (!db) return;
    const path = 'locations/' + id;
    try {
      await set(ref(db, path), {
        lat,
        lng,
        ts: Date.now(),
        active: true
      });
    } catch (err) {
      console.error('Firebase write failed', err);
    }
  }

  function startSharing() {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not available in this browser.');
      return;
    }

    if (!currentId) {
      currentId = makeId();
      localStorage.setItem('live_location_id', currentId);
    }

    startBtn.disabled = true;
    stopBtn.disabled = false;

    watchId = navigator.geolocation.watchPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      updateLocalMarker(lat, lng);
      if (db) await sendLocationToFirebase(currentId, lat, lng);
    }, (err) => {
      console.warn('geolocation error', err);
      // Note: keep trying; user can re-enable permissions
    }, {
      enableHighAccuracy: true,
      maximumAge: 1000 * 5,
      timeout: 10000
    });
  }

  async function stopSharing() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }

    startBtn.disabled = false;
    stopBtn.disabled = true;

    if (currentId && db) {
      // mark inactive (or remove) so viewers know sharing stopped
      try{
        await update(ref(db, 'locations/' + currentId), { active: false, ts: Date.now() });
      } catch(err) {
        console.warn('Failed to update active=false', err);
      }
    }
  }

  async function shareLink() {
    if (!currentId) {
      // not started yet, generate id so link works even before starting
      currentId = makeId();
      localStorage.setItem('live_location_id', currentId);
    }

    // Prompt for GitHub username to produce a GitHub Pages-style URL.
    // If you deploy elsewhere just copy the link and adapt.
    const username = window.prompt('Enter your GitHub username for the link (used to form the GitHub Pages URL):', 'myusername') || 'myusername';
    const url = `https://${encodeURIComponent(username)}.github.io/live-location/view.html?id=${encodeURIComponent(currentId)}`;

    try {
      await navigator.clipboard.writeText(url);
      alert('Share link copied to clipboard:\n' + url + '\n\nYou can paste and send it to others.');
    } catch (err) {
      // fallback: select text
      window.prompt('Copy this link:', url);
    }
  }

  startBtn.addEventListener('click', startSharing);
  stopBtn.addEventListener('click', stopSharing);
  shareBtn.addEventListener('click', shareLink);

  // If user previously shared, show last known position locally by reading db once
  if (currentId && db) {
    const p = ref(db, 'locations/' + currentId);
    // read once (get) for initial display; onValue would be used to subscribe
    try {
      const snap = await get(p);
      const v = snap.val();
      if (v && v.lat && v.lng) updateLocalMarker(v.lat, v.lng);
    } catch (err) {
      console.warn('Failed to read initial location', err);
    }
  }
}

// ----- Code for view.html (consuming) -----
function setupViewPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const statusEl = document.getElementById('status');
  const { map, markerLayer } = createMap('map');
  let locRef = null;

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  if (!id) {
    setStatus('Missing id in URL. Example: view.html?id=UNIQUE_ID');
    return;
  }

  setStatus('Connecting to live location...');

  if (!initFirebaseIfNeeded()) {
    setStatus('Firebase not configured on site. Edit script.js and add firebaseConfig.');
    return;
  }

  locRef = ref(db, 'locations/' + id);

  // Listen for realtime updates
  onValue(locRef, (snap) => {
    const data = snap.val();
    if (!data) {
      setStatus('No data for id: ' + id);
      markerLayer.clearLayers();
      return;
    }

    if (data.lat && data.lng) {
      markerLayer.clearLayers();
      const m = L.marker([data.lat, data.lng]).addTo(markerLayer);
      m.bindPopup('Live location').openPopup();
      map.setView([data.lat, data.lng], 16);
      setStatus('Last update: ' + new Date(data.ts || Date.now()).toLocaleString() + (data.active === false ? ' (sharing stopped)' : ''));
    } else {
      setStatus('Location not available yet');
    }
  }, (err) => {
    console.error('Firebase onValue error', err);
    setStatus('Could not read from Firebase. Check firebaseConfig and Realtime Database rules.');
  });
}

// ----- On load: detect page by presence of DOM elements -----
window.addEventListener('DOMContentLoaded', () => {
  // If page has startBtn, it's the share page
  if (document.getElementById('startBtn')) {
    setupSharePage();
  }
  // If page has status element (view page), set it up
  else if (document.getElementById('status')) {
    setupViewPage();
  } else {
    // generic - initialize map anyway
    createMap('map');
  }
});
