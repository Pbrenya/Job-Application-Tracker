# Namecheap shared hosting deployment (frontend + backend)

This guide walks you through deploying this repo to Namecheap shared hosting using cPanel. It assumes your plan includes **Node.js App** support. If your plan does not, you will need a VPS or another host for the backend.

Project layout in this repo:
- Backend: `server/` (Node/Express + MySQL)
- Frontend: `client/my-app/` (Next.js)

## 1) Check your hosting plan
1. Log in to cPanel.
2. Look for **Setup Node.js App**. If you do not see it, your plan does not support Node apps on shared hosting.

## 2) Choose your URLs (important)
You need a public URL for:
- The frontend: `https://yourdomain.com`
- The backend API: `https://api.yourdomain.com`

If the API is on a **different domain or subdomain**, your browser will block requests unless CORS is enabled (see the CORS note near the end).

## 3) Create the MySQL database
This backend uses MySQL (`mysql2`).

1. cPanel -> **MySQL Databases**.
2. Create a database (example: `job_tracker`).
3. Create a user and password.
4. Add the user to the database with **ALL PRIVILEGES**.
5. Write down these values:
   - DB_SERVER (usually `localhost` on Namecheap)
   - DB_USER
   - DB_PASSWORD
   - DB_DATABASE
   - DB_PORT (default 3306)

## 4) Upload the backend (server)
1. Create a folder for the backend on your server, for example:
   - `/home/<cpanel-user>/apps/jobtracker`
2. Upload the entire `server/` folder into that directory so you have:
   - `/home/<cpanel-user>/apps/jobtracker/server`
3. Create an `.env` file **one level above** the `server` folder, because `server/server.js` loads `../.env`.
   - Path should be: `/home/<cpanel-user>/apps/jobtracker/.env`
4. Add these environment variables inside `.env`:
   ```
   NODE_ENV=production
   JWT_SECRET=your_long_random_string
   DB_SERVER=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_DATABASE=your_db_name
   DB_PORT=3306
   UPLOAD_DIR=../uploads
   ```

Notes:
- `JWT_SECRET` should be long and random.
- `UPLOAD_DIR` is optional; it controls where resumes are stored. The default is `server/uploads`.
- Avoid uploading real credentials in `server/database.json`. It is not used by the app in production.

## 5) Create the backend Node.js App in cPanel
1. cPanel -> **Setup Node.js App** -> **Create Application**.
2. Set:
   - **Application root:** `/home/<cpanel-user>/apps/jobtracker/server`
   - **Application URL:** `https://api.yourdomain.com`
   - **Application startup file:** `server.js`
   - **Node version:** the newest available that supports Next/Node 18+ (use the latest available)
   - **Application mode:** production
3. Add environment variables in the app screen (use the same values as your `.env`).
4. Click **Create**.
5. Click **Run NPM Install** (or open Terminal and run `npm install` inside the `server` folder).
6. Click **Restart** on the app.

Quick test:
- Visit your API URL in a browser. You should see: `API is active`.

## 6) Create the database tables (schema)
The schema file is already in the repo:
- `server/migrations/sqls/20260508193850-initial-schema-up.sql`

Beginner-friendly approach (recommended):
1. cPanel -> **phpMyAdmin**.
2. Select your database.
3. Click **Import**.
4. Choose the SQL file above and import it.

Optional seed data:
- If you have SSH/Terminal access, run this inside the `server` folder:
  ```
  node scripts/seed.js
  ```

## 7) Upload and run the frontend (Next.js)
### Option A: Run the frontend as a Node.js app (recommended if available)
1. Create a folder for the frontend, for example:
   - `/home/<cpanel-user>/apps/jobtracker-web`
2. Upload the **contents** of `client/my-app/` into that folder.
3. cPanel -> **Setup Node.js App** -> **Create Application**.
4. Set:
   - **Application root:** `/home/<cpanel-user>/apps/jobtracker-web`
   - **Application URL:** `https://yourdomain.com`
   - **Application startup file:** `node_modules/next/dist/bin/next`
   - **Application mode:** production
5. Add env variables:
   - `NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com`
6. Click **Create**.
7. In the app screen, run:
   - `npm install`
   - `npm run build`
8. Restart the app.

If your API is hosted at `https://yourdomain.com/api`, you can omit `NEXT_PUBLIC_API_BASE_URL` and the frontend will call `/api` on the same origin.

### Option B: Static export (use only if you cannot run a second Node app)
This requires extra work and only succeeds if your pages can be fully static.
1. Update `client/my-app/next.config.ts` to include:
   ```
   const nextConfig: NextConfig = {
     output: "export",
   };
   ```
2. Add an export script in `client/my-app/package.json`:
   ```
   "export": "next export"
   ```
3. Run locally:
   ```
   npm install
   npm run build
   npm run export
   ```
4. Upload the generated `out/` folder contents into `public_html`.

## 8) CORS (only if frontend and backend are on different domains)
If your frontend is on `https://yourdomain.com` and the API is on `https://api.yourdomain.com`, you must enable CORS in the backend.

1. In `server/`, install cors:
   ```
   npm install cors
   ```
2. In `server/app.js`, add:
   ```
   const cors = require("cors");
   app.use(cors({ origin: "https://yourdomain.com" }));
   ```
3. Redeploy and restart the backend.

## 9) Final checklist
- Frontend loads in the browser.
- API root responds with `API is active`.
- Login/register works.
- Dashboard loads data.
- Resume upload works and creates files in your upload directory.

If you want, I can also add the CORS changes directly to the backend and commit them for you.