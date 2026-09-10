# AssetFlow - MERN Stack Asset Management System

A full-stack Asset Management application built with the **MERN** stack:
- **M**ongoDB (Mongoose ODM)
- **E**xpress.js (REST API backend)
- **R**eact.js (Vite + Modern UI + Lucide Icons)
- **N**ode.js (Server runtime)

---

## 🚀 Quick Start

### 1. Install Dependencies
Run the command below in the project root to install all dependencies (root, backend, and frontend):
```bash
npm run install:all
```
*(On Windows PowerShell, use `npm.cmd run install:all` if script policies apply)*

### 2. Configure Environment Variables
Verify or edit `server/.env`:
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/asset_mgmt
NODE_ENV=development
```
> **Tip**: You can use a local MongoDB instance or paste your MongoDB Atlas connection string.

### 3. Run Development Server
Start both Express backend and React frontend concurrently:
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5002](http://localhost:5002)
- **Backend API Server**: [http://localhost:5001](http://localhost:5001)
- **Health Check Endpoint**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## 📁 Project Structure

```
asset-mgmt/
├── package.json              # Orchestrates scripts across client and server
├── .gitignore
├── README.md
├── server/                   # Backend Express & MongoDB
│   ├── package.json
│   ├── .env.example
│   ├── .env
│   ├── server.js             # Express app entry
│   ├── config/
│   │   └── db.js             # MongoDB connection logic
│   ├── models/
│   │   └── Asset.js          # Mongoose schema
│   ├── controllers/
│   │   └── assetController.js# CRUD logic & KPI metrics
│   └── routes/
│       └── assetRoutes.js    # REST endpoints
└── client/                   # Frontend React & Vite
    ├── package.json
    ├── vite.config.js        # Vite config with API proxy
    ├── index.html
    └── src/
        ├── App.jsx           # Dashboard UI
        ├── main.jsx          # React bootstrap
        ├── index.css         # Styling
        └── services/
            └── api.js        # API service layer
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service and MongoDB health status |
| `GET` | `/api/assets/stats/summary` | Summary KPI metrics (Totals, Status counts, Valuation) |
| `GET` | `/api/assets` | List assets (supports `?search=`, `?category=`, `?status=`) |
| `POST` | `/api/assets` | Create a new asset |
| `GET` | `/api/assets/:id` | Get single asset details |
| `PUT` | `/api/assets/:id` | Update an existing asset |
| `DELETE` | `/api/assets/:id` | Delete an asset |
