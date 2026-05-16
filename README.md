# Neoteric Group — Legal Case Management System (MERN Stack)

Full-stack legal case management application built with **MongoDB · Express.js · React.js · Node.js**

---

## 📁 Project Structure

```
neoteric-legal/
├── backend/          ← Node.js + Express API
└── frontend/         ← React + Vite UI
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

---

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set your MONGO_URI
npm run seed        # Seeds admin user + 5 cases + 5 lawyers + 5 notifications
npm run dev         # Starts API on http://localhost:5000
```

**Default login credentials (after seed):**
| Field    | Value                |
|----------|----------------------|
| Email    | rahul@neoteric.in    |
| Password | admin123             |
| Role     | admin (Group CEO)    |

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev         # Starts UI on http://localhost:5173
```

Open **http://localhost:5173** — login and explore.

---

## 🔌 API Endpoints

### Auth
| Method | Route               | Description       |
|--------|---------------------|-------------------|
| POST   | /api/auth/register  | Register user     |
| POST   | /api/auth/login     | Login             |
| GET    | /api/auth/me        | Get current user  |
| PUT    | /api/auth/password  | Change password   |

### Cases
| Method | Route                               | Description            |
|--------|-------------------------------------|------------------------|
| GET    | /api/cases                          | List cases (+ filters) |
| GET    | /api/cases/stats                    | Dashboard stats        |
| GET    | /api/cases/:id                      | Get single case        |
| POST   | /api/cases                          | Create case            |
| PUT    | /api/cases/:id                      | Update case            |
| DELETE | /api/cases/:id                      | Delete case            |
| POST   | /api/cases/:id/adjournments         | Add adjournment        |
| DELETE | /api/cases/:id/adjournments/:adjId  | Remove adjournment     |
| POST   | /api/cases/:id/documents            | Upload document        |
| DELETE | /api/cases/:id/documents/:docId     | Remove document        |

### Lawyers
| Method | Route             | Description       |
|--------|-------------------|-------------------|
| GET    | /api/lawyers      | List all lawyers  |
| GET    | /api/lawyers/:id  | Lawyer + cases    |
| POST   | /api/lawyers      | Create lawyer     |
| PUT    | /api/lawyers/:id  | Update lawyer     |
| DELETE | /api/lawyers/:id  | Deactivate lawyer |

### Notifications
| Method | Route                          | Description        |
|--------|--------------------------------|--------------------|
| GET    | /api/notifications             | List notifications |
| POST   | /api/notifications             | Create             |
| PATCH  | /api/notifications/:id/read    | Mark read          |
| PATCH  | /api/notifications/read-all    | Mark all read      |
| PATCH  | /api/notifications/:id/resolve | Resolve            |
| DELETE | /api/notifications/:id         | Delete             |

---

## 🏗️ Architecture

```
Frontend (React)          Backend (Express)         Database (MongoDB)
──────────────────        ─────────────────         ─────────────────
AuthContext (JWT)    →    authRoutes                 User
caseService.js       →    caseController             Case
  ├ adjournments           ├ adjournments              ├ adjournments[]
  └ documents upload       └ multer upload             └ documents[]
lawyerService.js     →    lawyerController            Lawyer
notificationService  →    notificationRoutes          Notification
```

---

## 🔒 Roles & Permissions

| Role    | Cases        | Lawyers      | Notifications | Users  |
|---------|-------------|--------------|---------------|--------|
| admin   | Full CRUD   | Full CRUD    | Full CRUD     | Create |
| manager | Create/Edit | Create/Edit  | Create        | —      |
| viewer  | Read only   | Read only    | Read only     | —      |

---

## 🎨 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, React Router v6, Axios    |
| Styling   | Custom CSS (DM Sans + DM Serif)     |
| Icons     | Tabler Icons webfont                |
| Backend   | Node.js, Express.js, Morgan         |
| Database  | MongoDB, Mongoose 8                 |
| Auth      | JWT (jsonwebtoken + bcryptjs)       |
| Uploads   | Multer (local disk storage)         |
| Dev tools | Vite 5, Nodemon                     |

---

## 📦 Production Deployment

```bash
# Build frontend
cd frontend && npm run build

# Serve static files from backend
# Add to backend/server.js:
# app.use(express.static(path.join(__dirname, '../frontend/dist')));

# Set NODE_ENV=production and deploy to Railway, Render, or VPS
```

For cloud file storage in production, replace `multer` disk storage with **AWS S3** or **Cloudinary**.
