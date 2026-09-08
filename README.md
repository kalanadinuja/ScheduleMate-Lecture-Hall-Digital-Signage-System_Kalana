# ScheduleMate - Lecture Hall Digital Signage System (Admin Portal)

ScheduleMate is a Lecture Hall Digital Signage System built for **Sparkline Academy** (React + Node.js/Express + PostgreSQL + JWT + REST API).

---

## 🚀 How to Run the Application

### 1. Database & Migrations
Ensure PostgreSQL is running and `schedulemate_db` is created.

Apply the schema and migrations:
```bash
# Initial schema & seed (if setting up fresh)
psql -U postgres -d schedulemate_db -f database/schema.sql
psql -U postgres -d schedulemate_db -f database/seed.sql

# Run idempotent migration 002 (Adds location, descriptions, and statuses)
psql -U postgres -d schedulemate_db -f database/migrations/002_admin_ui_fields.sql
```

### 2. Backend Server (`server/`)
```bash
cd server
npm install
# Ensure .env contains DB credentials, JWT_SECRET, and JWT_EXPIRES_IN
npm run dev
```

### 3. Frontend Client (`client/`)
```bash
cd client
npm install
# Ensure .env contains REACT_APP_API_BASE_URL=http://localhost:5000/api
npm start
```
Access the Admin Portal in your browser at `http://localhost:3000`.

---

## 🕒 Timezone Assumption

All date and time calculations, current time comparisons, live room statuses, and computed session statuses (`Ongoing`, `Upcoming`, `Completed`, `Cancelled`, `Rescheduled`) operate strictly in the **`Asia/Colombo`** timezone (Sri Lanka Standard Time, UTC+5:30).

---

## 🔒 Delete Guard Strategy

To preserve relational data integrity and prevent orphan records:
- Hard deletes on parent entities (**Buildings**, **Floors**, **Floor Sides**, **Lecture Halls**, **Modules**, **Lecturers**) are blocked if dependent active or historical child records exist.
- When an administrator attempts to delete a parent entity that still has linked child records, the API returns an **`HTTP 409 Conflict`** response with an explicit error message (e.g., `"Cannot delete building: active floors are linked to this building"`).

---

## 🛠️ Environment Configuration & JWT Setup

### Backend Environment (`server/.env`)
```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_NAME=schedulemate_db
DB_PORT=5432
JWT_SECRET=schedulemate_secret_key_sparkline_academy_2026
JWT_EXPIRES_IN=8h
```

### Frontend Environment (`client/.env`)
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

---

## 📡 Complete Backend API Matrix

| Resource / Feature | Method | Path | Auth Required | Purpose |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/login` | No | Authenticate admin via email & password, return JWT token |
| **Auth** | `GET` | `/api/auth/me` | Yes | Get authenticated admin profile details |
| **Buildings** | `GET` | `/api/buildings` | Yes | List all institute buildings |
| **Buildings** | `GET` | `/api/buildings/:id` | Yes | Get details of a single building |
| **Buildings** | `POST` | `/api/buildings` | Yes | Create a new building |
| **Buildings** | `PUT` | `/api/buildings/:id` | Yes | Update an existing building |
| **Buildings** | `DELETE` | `/api/buildings/:id` | Yes | Delete a building (blocked if floors exist) |
| **Floors** | `GET` | `/api/floors` | Yes | List floors (supports `?building_id=` filter) |
| **Floors** | `GET` | `/api/floors/:id` | Yes | Get single floor details |
| **Floors** | `POST` | `/api/floors` | Yes | Create a new floor |
| **Floors** | `PUT` | `/api/floors/:id` | Yes | Update a floor |
| **Floors** | `DELETE` | `/api/floors/:id` | Yes | Delete a floor (blocked if floor sides exist) |
| **Floor Sides** | `GET` | `/api/floor-sides` | Yes | List floor sides (supports `?floor_id=` filter) |
| **Floor Sides** | `GET` | `/api/floor-sides/:id` | Yes | Get single floor side details |
| **Floor Sides** | `POST` | `/api/floor-sides` | Yes | Create a new floor side |
| **Floor Sides** | `PUT` | `/api/floor-sides/:id` | Yes | Update a floor side |
| **Floor Sides** | `DELETE` | `/api/floor-sides/:id` | Yes | Delete a floor side (blocked if halls/displays exist) |
| **Lecture Halls** | `GET` | `/api/lecture-halls` | Yes | List halls (supports `?floor_side_id=`, `?building_id=`, `?floor_id=`) |
| **Lecture Halls** | `GET` | `/api/lecture-halls/:id` | Yes | Get single lecture hall details |
| **Lecture Halls** | `POST` | `/api/lecture-halls` | Yes | Create a new lecture hall |
| **Lecture Halls** | `PUT` | `/api/lecture-halls/:id` | Yes | Update a lecture hall |
| **Lecture Halls** | `DELETE` | `/api/lecture-halls/:id` | Yes | Delete a lecture hall (blocked if sessions exist) |
| **Modules** | `GET` | `/api/modules` | Yes | List modules (supports `?department=`, `?module_type=`) |
| **Modules** | `GET` | `/api/modules/:id` | Yes | Get single module details |
| **Modules** | `POST` | `/api/modules` | Yes | Create a new module |
| **Modules** | `PUT` | `/api/modules/:id` | Yes | Update a module |
| **Modules** | `DELETE` | `/api/modules/:id` | Yes | Delete a module (blocked if sessions exist) |
| **Lecturers** | `GET` | `/api/lecturers` | Yes | List lecturers (supports `?search=` filter for name/email/code) |
| **Lecturers** | `GET` | `/api/lecturers/:id` | Yes | Get single lecturer details |
| **Lecturers** | `POST` | `/api/lecturers` | Yes | Create a new lecturer |
| **Lecturers** | `PUT` | `/api/lecturers/:id` | Yes | Update a lecturer |
| **Lecturers** | `DELETE` | `/api/lecturers/:id` | Yes | Delete a lecturer (blocked if sessions exist) |
| **Sessions** | `GET` | `/api/sessions` | Yes | List sessions (filters: `?date=`, `?date_from=`, `?date_to=`, `?building_id=`, `?floor_id=`, `?hall_id=`, `?status=`) |
| **Sessions** | `GET` | `/api/sessions/:id` | Yes | Get single session details with computed status |
| **Sessions** | `POST` | `/api/sessions` | Yes | Create session with hall overlap check |
| **Sessions** | `PUT` | `/api/sessions/:id` | Yes | Edit session with hall overlap check |
| **Sessions** | `PATCH` | `/api/sessions/:id/cancel` | Yes | Cancel session with required reason |
| **Sessions** | `PATCH` | `/api/sessions/:id/reschedule` | Yes | Reschedule session (preserves `original_*` fields) |
| **Sessions** | `DELETE` | `/api/sessions/:id` | Yes | Hard delete session |
| **Displays** | `GET` | `/api/displays` | Yes | List all digital displays |
| **Displays** | `GET` | `/api/displays/:id` | Yes | Get single digital display details |
| **Displays** | `POST` | `/api/displays` | Yes | Create a new digital display configuration |
| **Displays** | `PUT` | `/api/displays/:id` | Yes | Update digital display configuration |
| **Displays** | `DELETE` | `/api/displays/:id` | Yes | Delete a digital display |
| **Public Signage**| `GET` | `/api/signage/:displayId` | **No** | TV display main endpoint (ongoing, upcoming, cancelled, rescheduled) |
| **Public Signage**| `GET` | `/api/signage/:displayId/room-status` | **No** | TV display live room status per hall on floor side |
| **Dashboard** | `GET` | `/api/dashboard` | Yes | Summary counts for admin dashboard cards, room occupancy, & session breakdown |
