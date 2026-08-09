# Smart Expense Tracker

A full-stack expense tracker — React frontend + Node/Express backend, now running on **MongoDB (Mongoose)**.

## What changed in this update

**Bug fixed:** new accounts were seeing other users' transactions (e.g. an old ৳500 test expense showing up right after registering). Root cause was two-fold:
1. The `transactions` table/collection had no owner field — every transaction was global, shared by all accounts.
2. No route was protected by authentication, so the API never knew *which* user was asking.

**Fix:**
- Every transaction is now linked to the user who created it (`user` field, `ObjectId` ref).
- All transaction routes now require a valid login token (`Authorization: Bearer <token>`).
- Every query (`get`, `add`, `update`, `delete`) is scoped to `req.userId`, so users only ever see or touch their own data.
- **Database switched from MySQL to MongoDB** (Mongoose) — no more manual `ALTER TABLE` migrations; the `user` field just lives on each document.

---

## Project structure

```
SmartExpenseTracker/
  backend/     Node.js + Express + MongoDB (Mongoose) API
  frontend/    React app (Create React App)
```

---

## Backend setup

```bash
cd backend
npm install
```

### 1. Configure `.env`

`backend/.env` already exists with sane defaults — edit as needed:

```env
# Local MongoDB:
MONGO_URI=mongodb://127.0.0.1:27017/expense_tracker

# Or MongoDB Atlas (cloud, recommended for deployment):
# MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/expense_tracker?retryWrites=true&w=majority

JWT_SECRET=change-this-to-a-long-random-secret
PORT=5000
```

### 2. Get a MongoDB instance

**Option A — Local:**
```bash
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Option B — MongoDB Atlas (free tier, works well for deploys like Railway/Render):**
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user (username/password)
3. Copy the connection string from "Connect" → "Drivers"
4. Paste it into `MONGO_URI` in `.env`

### 3. Run

```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start
```

You should see `MongoDB Connected Successfully` in the console.

---

## Frontend setup

```bash
cd frontend
npm install
```

`frontend/.env` controls which backend it talks to:
```env
REACT_APP_API_URL=http://localhost:5000
```
(Update this to your deployed backend URL in production.)

```bash
npm start     # dev server
# or
npm run build # production build
```

---

## Deployment notes

- Backend: any Node host works (Railway, Render, Fly.io, a VPS, etc.). Just make sure `MONGO_URI` and `JWT_SECRET` are set as environment variables on the host — don't rely on the committed `.env` in production, set them in the host's dashboard/secrets instead.
- Frontend: any static host (Vercel, Netlify, etc.) or served via the same VPS. Set `REACT_APP_API_URL` to your live backend URL before building.
- **Important:** rotate `JWT_SECRET` to a real random value before going live — the placeholder value in `.env` is not safe for production.

---

## API overview

| Method | Route                        | Auth required | Description                     |
|--------|-------------------------------|----------------|----------------------------------|
| POST   | `/api/users/register`         | No             | Create a new account            |
| POST   | `/api/users/login`            | No             | Log in, returns JWT             |
| GET    | `/api/transactions`           | Yes            | Get the logged-in user's transactions |
| POST   | `/api/transactions/add`       | Yes            | Add a transaction               |
| PUT    | `/api/transactions/:id`       | Yes            | Update own transaction          |
| DELETE | `/api/transactions/:id`       | Yes            | Delete own transaction          |

All authenticated routes expect header: `Authorization: Bearer <token>`.
