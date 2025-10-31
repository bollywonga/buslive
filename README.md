# Share & See — Live Location

A very small static site (HTML/CSS/JS) that shares live location via Leaflet + OpenStreetMap and Firebase Realtime Database.

Files
- `index.html` — main page to start/stop sharing and generate a share link.
- `view.html` — viewer page that reads `?id=UNIQUE_ID` and shows the live marker.
- `script.js` — main JavaScript (ES module). Add your Firebase config here.
- `style.css` — simple styling.

Quick overview
- The sharer uses `navigator.geolocation.watchPosition()` to continuously send {lat,lng,ts,active} to `/locations/<id>` in Realtime Database.
- The viewer reads the `id` query param, listens to `/locations/<id>`, and updates the marker live.

Prerequisites
- Modern browser with support for ES modules and Geolocation (Chrome, Firefox, Edge, Safari).
- A Firebase project with Realtime Database enabled.
- Serve the site over HTTPS or `localhost` (geolocation and clipboard APIs require secure context).

Firebase setup (step-by-step)
1. Go to https://console.firebase.google.com/ and create a new project (or use an existing one).
2. In the project, click "Add app" → Web and register a new web app. Copy the firebaseConfig object that Firebase shows.
3. In this repo, open `script.js` and set the `firebaseConfig` object to the values you copied.

Example (replace with your values):

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "<project>.firebaseapp.com",
  databaseURL: "https://<your-db-name>.firebaseio.com",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

4. Realtime Database: in the Firebase console, open Realtime Database and create a database (region of your choice).
5. For quick testing only, set the rules to public (be aware this is insecure):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Publish these rules and test the site. For production, add authentication and tighter rules.

Local testing (PowerShell / Windows)
- Browsers block geolocation on `file://`. Run a simple static server:

Using Python 3 (if installed):

```powershell
# from the project folder
python -m http.server 8000
```

Using Node (npx http-server):

```powershell
npx http-server -p 8000
```

Then open `http://localhost:8000/index.html` in your browser. (Localhost is considered a secure context for geolocation.)

Deploy to GitHub Pages (simple)
1. Create a GitHub repository (for the default share link in the UI we used `live-location` as the repository name).
2. Commit and push the repo's files (index.html, view.html, script.js, style.css, README.md) to the `main` branch.
3. In the repo settings → Pages, set the source to `main` branch and `/ (root)` folder and save.
4. After a minute, your site will be available at `https://<your-username>.github.io/<repo-name>/`.

Share link notes
- The app's `Share` button generates a link like:
  `https://<username>.github.io/live-location/view.html?id=UNIQUE_ID`
  It prompts for your GitHub username so it can generate a GitHub Pages-style URL. If you deploy to a different host or folder, edit `script.js` (shareLink()) to build the correct base URL or simply copy/share the relative link: `view.html?id=UNIQUE_ID`.

Security & cleanup
- Public database rules allow anyone to overwrite `locations/*`. Use these rules for quick testing only.
- Consider adding a small cleanup policy (server-side) to remove stale `locations/<id>` entries after a timeout.

Troubleshooting
- Map doesn't load: ensure Leaflet CSS/JS loaded (check DevTools Network). Ensure `script.js` is loaded as a module.
- Geolocation denied: allow the browser to access location; serve via HTTPS or localhost.
- Firebase errors: check that `firebaseConfig.databaseURL` matches your Realtime Database URL, and rules allow read/write.

Next steps (suggested)
- Add authentication so users can only write their own location nodes.
- Add a simple token or short-lived key when generating share links to prevent random overwrites.
- Add a small server-side cleanup worker to delete nodes not updated in X hours.

If you'd like, I can:
- Replace the current firebaseConfig in `script.js` with a clear placeholder (I left it as-is per your request).
- Add a small PowerShell script to open a local server and launch the default browser.
- Add guidance to set stricter Realtime Database rules for a basic authenticated setup.

Enjoy — tell me which of the optional follow-ups you'd like me to implement.
