# Primetrade Internship Project

This repository contains a simple task-management backend and a Next.js frontend built for the Primetrade.ai internship assignment. The project demonstrates authentication (JWT), role-based access (user/admin), and CRUD operations for a `Task` entity backed by PostgreSQL (Sequelize).

---

## Repository Layout

- `backend/` — Express + Sequelize backend API
- `frontend/` — Next.js frontend UI

---

## Requirements

- Node.js >= 18
- PostgreSQL (or a hosted Postgres DB like Supabase)

---

## Environment Variables

Create a `.env` file in `backend/` with the following variables:

```
DATABASE_URL=postgres://user:password@host:5432/dbname
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
NODE_ENV=development
```

Notes:
- If you use Supabase, `DATABASE_URL` is provided in the Supabase project settings.
- Keep `JWT_SECRET` secure in production.

---

## Setup & Run (Backend)

1. Open a terminal and install dependencies:

```bash
cd backend
npm install
```

2. Run in development (auto-restart with `nodemon`):

```bash
npm run dev
```

3. Start in production:

```bash
npm start
```

Server default: `http://localhost:5000`

---

## Setup & Run (Frontend)

1. Install frontend deps:

```bash
cd frontend
npm install
```

2. Run Next.js development server:

```bash
npm run dev
```

Frontend default: `http://localhost:3000`

Make sure `CLIENT_ORIGIN` in your backend `.env` matches the frontend origin.

---

## API Summary

Base URL: `/api/v1`

Auth endpoints:
- `POST /api/v1/auth/register` — register (body: `{ email, password, role? }`)
- `POST /api/v1/auth/login` — login (body: `{ email, password }`)

Task endpoints (require `Authorization: Bearer <token>`):
- `GET /api/v1/tasks` — list tasks (users see own tasks; admins see all)
- `POST /api/v1/tasks` — create task (admin may set `userId` to assign)
- `GET /api/v1/tasks/:id` — get task
- `PUT /api/v1/tasks/:id` — update task
- `DELETE /api/v1/tasks/:id` — delete task

Admin-only (recommended to add):
- `GET /api/v1/users` — list users (id + email) — useful for frontend assignee dropdown

---

## API Docs (Swagger)

If mounted, API docs will be available at `http://localhost:5000/api-docs` and will include a `Authorize` button to use JWT tokens. (If not yet present, you can add `swagger-ui-express` and a minimal `swagger.json`.)

---

## Testing the Flow

1. Register a user via `/auth/register`.
2. Login to receive a JWT token.
3. Use the token in `Authorization: Bearer <token>` to access protected routes.
4. As an admin, create tasks for other users by setting `userId` on creation.

---

## Short Scalability Notes

- Use Redis for caching frequently-read resources (task lists, user lookups).
- Add database indexing for frequently queried columns (e.g., `userId`, `createdAt`).
- Use Sequelize migrations for schema changes in production.
- Containerize with Docker and orchestrate with `docker-compose` or Kubernetes for scaling.
- Add a load balancer (NGINX or managed) and auto-scaling for app instances.



