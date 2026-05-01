# ⚡ TeamTask Manager — Full Stack MERN App

A complete **Team Task Manager** with **Role-Based Access Control** (Admin/Member).

---

## 🗂️ Folder Structure

```
team-task-manager/
├── backend/
│   ├── config/
│   ├── controllers/
│   │   ├── authController.js       # Login, Register, GetMe
│   │   ├── projectController.js    # CRUD + Member management
│   │   ├── taskController.js       # CRUD + Submit + Comments + Dashboard
│   │   └── userController.js       # User list + Role update
│   ├── middleware/
│   │   └── auth.js                 # JWT protect + adminOnly
│   ├── models/
│   │   ├── User.js                 # User schema (bcrypt password)
│   │   ├── Project.js              # Project + members
│   │   └── Task.js                 # Task + status + comments
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── users.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       └── Layout.js       # Sidebar + navigation
│   │   ├── context/
│   │   │   └── AuthContext.js      # Global auth state
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js        # Stats + recent tasks
│   │   │   ├── Projects.js         # Project list + create
│   │   │   ├── ProjectDetail.js    # Tasks + members + submit
│   │   │   ├── Tasks.js            # Admin: all tasks table
│   │   │   ├── MyTasks.js          # Member: own tasks + submit
│   │   │   └── AdminPanel.js       # User list + role management
│   │   ├── utils/
│   │   │   └── api.js              # All axios API calls
│   │   ├── App.js                  # Routes + protected routes
│   │   ├── index.css               # Global styles
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <your-repo>
cd team-task-manager

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

### 2. Configure Environment

**backend/.env**
```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/teamtaskdb
JWT_SECRET=your_super_secret_key_here
PORT=5000
CLIENT_URL=http://localhost:3000
```

**frontend/.env**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Run Development
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm start
```

---

## 🔐 Role-Based Access

| Feature | Admin | Member |
|---------|-------|--------|
| Create Projects | ✅ | ❌ |
| Add/Remove Members | ✅ | ❌ |
| Create Tasks | ✅ | ❌ |
| Assign Tasks | ✅ | ❌ |
| View All Tasks | ✅ | ❌ |
| Update Task Status | ✅ (any) | ✅ (own only) |
| Submit Task for Review | ❌ | ✅ |
| Approve/Reject Submission | ✅ | ❌ |
| Admin Panel | ✅ | ❌ |
| Manage User Roles | ✅ | ❌ |

---

## 📋 API Endpoints

### Auth
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Projects
- `GET /api/projects` — Get user's projects
- `POST /api/projects` — Create project *(Admin)*
- `GET /api/projects/:id` — Get project details
- `PUT /api/projects/:id` — Update project *(Admin)*
- `DELETE /api/projects/:id` — Delete project *(Admin)*
- `POST /api/projects/:id/members` — Add member *(Admin)*
- `DELETE /api/projects/:id/members/:userId` — Remove member *(Admin)*

### Tasks
- `GET /api/tasks` — Get tasks (filtered by role)
- `GET /api/tasks/my` — Member's own tasks
- `GET /api/tasks/dashboard` — Dashboard stats
- `POST /api/tasks` — Create task *(Admin)*
- `GET /api/tasks/:id` — Get task detail
- `PUT /api/tasks/:id` — Update task (Admin: all fields, Member: status only)
- `POST /api/tasks/:id/submit` — Submit task *(Member)*
- `POST /api/tasks/:id/comments` — Add comment
- `DELETE /api/tasks/:id` — Delete task *(Admin)*

### Users
- `GET /api/users` — All users *(Admin)*
- `GET /api/users/members` — All members
- `PUT /api/users/:id/role` — Update role *(Admin)*

---

## 🌐 Deploy on Railway

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add MongoDB service (or use MongoDB Atlas)
4. Set environment variables in Railway dashboard
5. Deploy both backend and frontend as separate services

**Backend env vars:**
- `MONGO_URI` → MongoDB Atlas connection string
- `JWT_SECRET` → Any secret string
- `CLIENT_URL` → Your frontend Railway URL

**Frontend env vars:**
- `REACT_APP_API_URL` → Your backend Railway URL + `/api`

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs
- **Frontend:** React.js, React Router v6, Axios, React Hot Toast, date-fns
- **Auth:** JWT tokens stored in localStorage
- **Styling:** Custom CSS with CSS variables (dark theme)
