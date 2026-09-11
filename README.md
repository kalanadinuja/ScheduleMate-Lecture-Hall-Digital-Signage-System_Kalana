# ScheduleMate - Lecture Hall Digital Signage System

A full-stack digital signage and live lecture-hall scheduling system for Sparkline Academy.

Built with React + Node.js/Express + PostgreSQL + JWT + REST API + 30-60 second polling.

Developed by Kalana Dinuja

---

## Table of Contents

1. Project Overview
2. Project Status
3. Business Problem
4. Project Objectives
5. User Roles
6. Major System Capabilities
7. System Architecture
8. Technology Stack
9. Repository Structure
10. Database Schema
11. API Endpoints
12. Digital Signage Viewer
13. Slide Rotation Logic
14. Live Room Status
15. Timezone Assumption
16. Delete Guard Strategy
17. Security Implementation
18. Local Development Setup
19. Environment Variables
20. Testing & Verification
21. Git & Branch Workflow
22. Important Assumptions
23. Test Credentials
24. Known Limitations
25. Future Enhancements

---

## 1. Project Overview

ScheduleMate is a full-stack Lecture Hall Digital Signage System designed for Sparkline Academy - an imaginary educational institute with two buildings (Main Building: 10 floors, New Building: 14 floors).

The system dynamically displays current, upcoming, cancelled, and rescheduled academic sessions on digital signage displays mounted in lecture-hall corridors, while providing administrators with a complete management interface.

The platform provides a connected workflow covering:

- Admin authentication with JWT
- Complete CRUD for buildings, floors, floor sides, and lecture halls
- Module and lecturer management
- Full lecture-session lifecycle (create, edit, cancel, reschedule)
- Automatic hall-conflict detection
- Digital display configuration
- Public TV signage viewer with auto-rotation
- Live room-status calculation
- Conditional slides for cancelled and rescheduled sessions
- 30-60 second polling for real-time updates
- Dashboard with real-time statistics
- Reports with CSV export

---

## 2. Project Status

| Area | Current Status |
|------|----------------|
| Requirement Analysis | Completed |
| System Design | Completed |
| Low-Fidelity Wireframes | Completed |
| UI/UX Design (Admin + Signage) | Completed |
| Backend Development | Completed |
| Frontend Development (Admin) | Completed |
| Frontend Development (Signage) | Completed |
| Frontend-Backend Integration | Completed |
| Database Schema + Migrations | Completed |
| Module-Level Verification | Completed |
| README and Documentation | Completed |

Development status: The complete ScheduleMate system has been implemented and tested.

---

## 3. Business Problem

Traditional lecture-hall scheduling faces several problems:

- Students cannot easily see what's happening in a hall right now
- Cancelled or rescheduled lectures are not visible until students arrive
- No visual indicator of room availability
- Manual notice boards are outdated the moment they're printed
- No way for administrators to know if a display is online
- Changes in schedule take hours to propagate

ScheduleMate solves these problems by:

- Displaying live session data on corridor TVs
- Auto-rotating through relevant information
- Refreshing data every 30-60 seconds
- Showing cancelled/rescheduled sessions immediately
- Providing a complete admin panel for schedule management
- Calculating live room status from real schedule data

---

## 4. Project Objectives

The primary objectives are:

- Provide real-time digital signage for lecture-hall corridors
- Display ongoing, upcoming, cancelled, and rescheduled sessions
- Show live room-status per hall
- Automatically skip slides when there's no data
- Enable administrators to manage all scheduling data
- Prevent double-booking of halls
- Store original schedule when rescheduling
- Calculate session status dynamically (not hard-coded)
- Use 30-60 second polling for updates
- Support multiple displays per building/floor/side

---

## 5. User Roles

Administrator (Authenticated)

The Administrator manages the complete system:

- Login with email + password (JWT)
- Manage buildings, floors, floor sides, and lecture halls
- Manage modules and lecturers
- Create, edit, cancel, and reschedule lecture sessions
- Configure digital displays
- View real-time dashboard statistics
- Generate reports with CSV export
- View live room status

Digital Signage Viewer (Public - No Login)

Students, lecturers, staff, and visitors:

- Simply look at the TV monitor in a corridor
- No interaction required
- Automatic slide rotation
- Location-specific information
- Live session status
- Auto-refresh every 30-60 seconds

Display System (System Actor)

The digital display itself:

- Polls the backend every 30-60 seconds
- Rotates through 4 slides automatically
- Shows ongoing, upcoming, room status, session updates
- Skips conditional slides when no data exists
- Displays live clock ticking every second

---

## 6. Major System Capabilities

Authentication and Authorization
- JWT-based admin login
- bcrypt password hashing
- Protected admin routes (401 on missing/invalid token)
- Public signage routes (no auth required)
- Token expiration (8 hours default)
- Middleware-based authorization

Location Management
- Buildings (Main Building, New Building)
- Floors (10 in Main, 14 in New)
- Floor Sides (A/B, G/F)
- Lecture Halls (with capacity, type, status)
- Cascading dropdowns in admin UI

Academic Data Management
- Modules (code, name, department, type)
- Lecturers (code, name, title, email, department)
- Session types: Lecture / Lab
- Hall types: Lecture / Lab / Large Lecture Hall

Lecture Session Lifecycle
- Create sessions with conflict detection
- Edit sessions with overlap check
- Cancel sessions with reason
- Reschedule sessions (preserves original schedule)
- Hard delete for admin corrections
- Computed status: Ongoing / Upcoming / Completed / Cancelled / Rescheduled

Conflict Detection
- Same hall + same date + overlapping time = 409 Conflict
- Prevents double-booking
- Applied to create, edit, and reschedule

Digital Signage
- Public route: /signage/:displayCode
- Dual lookup: numeric ID or display code (e.g., DSP-0101)
- 4-slide rotation: Ongoing, Upcoming, Room Status, Session Updates (conditional)
- Auto-refresh every 30-60 seconds
- Live clock ticking every second
- Countdown timers on upcoming sessions
- Resilient to network failures

Dashboard and Reports
- Real-time stat cards
- Today's schedule breakdown
- Room occupancy summary
- Display status breakdown
- Reports with date range and CSV export

---

## 7. System Architecture

```
CLIENT (React)

- ADMIN PANEL (Authenticated)
  - Login
  - Dashboard
  - CRUD pages
  - Sessions

- SIGNAGE VIEWER (Public, read-only)
  - Auto-rotation
  - Polling 30-60s
  - Live clock
  - Room status

        REST/HTTPS + JWT   |   REST/HTTPS (public)
                |
                v

BACKEND (Node.js + Express)

  Routes -> Middleware -> Controllers -> Services -> Models

  - Auth Middleware (JWT)
  - Session Status Service
  - Signage Polling Endpoints

                |
                v

DATABASE (PostgreSQL)

  admins, buildings, floors, floor_sides, lecture_halls,
  modules, lecturers, lecture_sessions, digital_displays
```

---

## 8. Technology Stack

Every major technology choice below was made for a specific, project-related
reason, not just familiarity — each one maps to a concrete requirement in
the assignment brief.

### Frontend

| Technology | Purpose |
|-----------|---------|
| React | Component-based UI |
| React Router | Client-side routing |
| Axios | HTTP client with interceptors |
| Tailwind CSS | Utility-first styling |
| Lucide React | Icon library |
| Context API | Simple auth state management |

**Why React?**
The system has two structurally different UIs sharing one codebase — a
data-heavy, form-driven admin panel and a read-only, auto-rotating signage
display. React's component model lets both be built from the same reusable
building blocks (cards, pills, tables, modals) while keeping them on
completely separate route trees, without needing two separate projects.
Its one-way data flow also makes the signage viewer's polling-driven state
(new data every 30-60s) predictable to reason about — a fetch simply
produces new props, and the UI re-renders deterministically.

**Why Node.js + Express (over Java/Spring Boot or .NET)?**
The whole stack — client and server — is JavaScript, which meant no
context-switching between languages for a single-developer, two-week
timeline. Express's middleware pattern maps directly onto this project's
actual request pipeline (JWT verification → validation → controller →
response), and its minimal-framework approach was appropriate for a REST
API of this size, where a heavier framework's conventions (e.g., Spring's
DI/annotations) would have added ceremony without added value.

**Why PostgreSQL (over MongoDB)?**
The data model is inherently relational: Building → Floor → Floor Side →
Lecture Hall is a strict hierarchy, and Lecture Sessions reference three
other entities at once (Module, Lecturer, Hall) with real constraints that
matter — a session must reference a hall that exists, and two sessions
must not silently overlap in the same hall. PostgreSQL's foreign keys,
`CHECK` constraints, and transactional guarantees enforce these rules at
the database level, not just in application code. A document store like
MongoDB would have meant re-implementing referential integrity and the
overlap-conflict check entirely in JavaScript, with no safety net if a
bug let bad data through.

**Why JWT (over server-side sessions)?**
The admin panel and the signage viewer needed to sit behind different
authentication requirements on the exact same backend — admin routes
protected, signage routes public. JWTs let this be a single stateless
middleware check (`verifyToken`) applied selectively per route, with no
server-side session store to keep in sync between requests. Statelessness
also matters for the admin panel, which may be opened on more than one
device by the same admin without needing shared session storage.

**Why REST over HTTPS (over GraphQL)?**
Every resource in this system maps cleanly onto a REST resource
(`/api/buildings`, `/api/sessions`, etc.) with standard CRUD verbs — there
was no need for GraphQL's flexible querying, and REST's simplicity meant
faster, more explainable endpoints for a two-week solo build. It's also
trivially testable with Postman/curl before any frontend exists, which
matches the brief's own recommended workflow (test the backend before
building React).

**Why 30-60 second polling (over WebSockets)?**
- Simpler to implement and debug
- Sufficient for 30-60 second update frequency — a lecture hall's status
  does not need sub-second updates
- No persistent connection overhead on the server, which matters for
  multiple TV displays polling continuously and unattended for hours
- More reliable across networks/proxies than a long-lived socket
  connection, which is a real concern for hardware mounted in a corridor
  with no one to reconnect it manually

**Why bcrypt for password hashing?**
It is the standard, well-audited choice for password hashing in Node,
with a configurable work factor (salt rounds) that makes brute-forcing
stored hashes computationally expensive — appropriate given this system
stores real admin credentials.

**Why Tailwind CSS (over a component library like Material UI)?**
The admin panel and the signage viewer needed two visually distinct design
languages (a conventional dashboard vs. a high-contrast, large-text TV
display) from the same codebase. A utility-first approach made it
possible to hit the exact spacing/typography/color values from the
high-fidelity mockups precisely, rather than working around a pre-styled
component library's defaults.

---

## 9. Repository Structure

```
ScheduleMate-Lecture-Hall-Digital-Signage-System_Kalana/
|
+-- client/                              # React Frontend
|   +-- public/
|   +-- src/
|   |   +-- api/                         # Axios + API modules
|   |   +-- components/
|   |   |   +-- common/                  # Reusable UI
|   |   |   +-- layout/                  # Sidebar, Topbar, Layout
|   |   +-- context/                     # AuthContext
|   |   +-- pages/                       # Admin pages
|   |   +-- signage/                     # Public signage viewer
|   |   |   +-- components/
|   |   |   +-- hooks/
|   |   |   +-- slides/
|   |   |   +-- SignagePage.js
|   |   +-- App.js
|   |   +-- index.js
|   |   +-- index.css
|   +-- .env.example
|   +-- package.json
|   +-- tailwind.config.js
|   +-- postcss.config.js
|
+-- server/                              # Node.js Backend
|   +-- src/
|   |   +-- config/database.js
|   |   +-- controllers/                 # 11 controllers
|   |   +-- middleware/                  # auth, errorHandler, logger
|   |   +-- routes/                      # 11 route files
|   |   +-- services/                    # 3 services
|   |   +-- scripts/hashAdminPassword.js
|   |   +-- validations/
|   +-- .env.example
|   +-- package.json
|   +-- server.js
|
+-- database/
|   +-- schema.sql
|   +-- seed.sql
|   +-- migrations/
|       +-- 002_admin_ui_fields.sql
|       +-- 003_signage_hall_notes.sql
|
+-- docs/
|   +-- ui-reference/                    # High-fidelity mockups
|
+-- .gitignore
+-- README.md
```

---

## 10. Database Schema

Tables

| Table | Purpose |
|-------|---------|
| admins | Admin users for authentication |
| buildings | Campus buildings |
| floors | Floors within buildings |
| floor_sides | Sides of each floor (A/B, G/F) |
| lecture_halls | Rooms and labs with capacity |
| modules | Academic modules |
| lecturers | Faculty members |
| lecture_sessions | Scheduled sessions with cancellation/reschedule tracking |
| digital_displays | Configured signage screens |

Relationships

```
Building 1:N Floor 1:N Floor Side 1:N Lecture Hall
                                        |
                                        v
Module   -+                 Lecture Session 1:N Digital Display
          +-- 1:N ---------+   (per floor-side)
Lecturer -+
```

Migration History

`database/schema.sql` is the baseline schema, created once at the start of
development and applied directly — it is not itself tracked as a numbered
migration, which is why the first migration file is `002` rather than
`001`.

| Migration | Purpose |
|-----------|---------|
| 002_admin_ui_fields.sql | Adds location (buildings), description (floors), status (floor_sides), description (lecture_sessions) |
| 003_signage_hall_notes.sql | Adds status_note and status_until (lecture_halls) for signage maintenance messages |

All migrations are idempotent (ADD COLUMN IF NOT EXISTS) - safe to re-run.

---

## 11. API Endpoints

All endpoints use the base path /api.

Authentication

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /api/auth/login | No | Login, return JWT token |
| GET | /api/auth/me | Yes | Get authenticated admin profile |

Buildings

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/buildings | Yes | List all buildings |
| GET | /api/buildings/:id | Yes | Get single building |
| POST | /api/buildings | Yes | Create building |
| PUT | /api/buildings/:id | Yes | Update building |
| DELETE | /api/buildings/:id | Yes | Delete (409 if floors exist) |

Floors

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/floors | Yes | List (supports ?building_id=) |
| GET | /api/floors/:id | Yes | Get single |
| POST | /api/floors | Yes | Create |
| PUT | /api/floors/:id | Yes | Update |
| DELETE | /api/floors/:id | Yes | Delete (409 if floor sides exist) |

Floor Sides

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/floor-sides | Yes | List (supports ?floor_id=) |
| GET | /api/floor-sides/:id | Yes | Get single |
| POST | /api/floor-sides | Yes | Create |
| PUT | /api/floor-sides/:id | Yes | Update |
| DELETE | /api/floor-sides/:id | Yes | Delete (409 if halls/displays exist) |

Lecture Halls

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/lecture-halls | Yes | List (supports ?floor_side_id=, ?building_id=, ?floor_id=) |
| GET | /api/lecture-halls/:id | Yes | Get single |
| POST | /api/lecture-halls | Yes | Create |
| PUT | /api/lecture-halls/:id | Yes | Update |
| DELETE | /api/lecture-halls/:id | Yes | Delete (409 if sessions exist) |

Modules

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/modules | Yes | List (supports ?department=, ?module_type=) |
| GET | /api/modules/:id | Yes | Get single |
| POST | /api/modules | Yes | Create |
| PUT | /api/modules/:id | Yes | Update |
| DELETE | /api/modules/:id | Yes | Delete (409 if sessions exist) |

Lecturers

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/lecturers | Yes | List (supports ?search=) |
| GET | /api/lecturers/:id | Yes | Get single |
| POST | /api/lecturers | Yes | Create |
| PUT | /api/lecturers/:id | Yes | Update |
| DELETE | /api/lecturers/:id | Yes | Delete (409 if sessions exist) |

Lecture Sessions

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/sessions | Yes | List (filters: ?date=, ?date_from=, ?date_to=, ?building_id=, ?floor_id=, ?hall_id=, ?status=) |
| GET | /api/sessions/:id | Yes | Get single with computed status |
| POST | /api/sessions | Yes | Create with overlap check |
| PUT | /api/sessions/:id | Yes | Edit with overlap check |
| PATCH | /api/sessions/:id/cancel | Yes | Cancel with required reason |
| PATCH | /api/sessions/:id/reschedule | Yes | Reschedule (preserves original_* fields) |
| DELETE | /api/sessions/:id | Yes | Hard delete |

Digital Displays

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/displays | Yes | List all displays |
| GET | /api/displays/:id | Yes | Get single |
| POST | /api/displays | Yes | Create configuration |
| PUT | /api/displays/:id | Yes | Update |
| DELETE | /api/displays/:id | Yes | Delete |

Public Signage (No Auth)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/signage/:displayId | No | Main TV display data (supports id or code) |
| GET | /api/signage/:displayId/room-status | No | Live room status per hall |

Dashboard

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/dashboard | Yes | Summary stats + occupancy + session breakdown |

---

## 12. Digital Signage Viewer

URL Format

    http://localhost:3000/signage/:displayCode

Examples:
- http://localhost:3000/signage/DSP-0101
- http://localhost:3000/signage/1 (numeric ID also works)

How a TV Display Works

1. Admin creates a Display in the Admin Panel
2. Display has a unique code (e.g., DSP-0101)
3. TV browser opens http://localhost:3000/signage/DSP-0101
4. Display auto-loads and rotates through slides
5. No login, no interaction required

Slide Rotation

Order: Ongoing, Upcoming, Room Status, Session Updates (if any), Repeat

Conditional Slides:
- Session Updates is skipped if there are 0 cancelled AND 0 rescheduled sessions today

---

## 13. Slide Rotation Logic

Duration Rules

| Slide | Items | Duration |
|-------|-------|----------|
| Ongoing | 0 | 10 sec (empty state) |
| Ongoing | 1-3 | 30 sec |
| Ongoing | 4+ | 10 sec per page (3 per page) |
| Upcoming | 0 | 10 sec (empty state) |
| Upcoming | 1-3 | 30 sec |
| Upcoming | 4+ | 10 sec per page |
| Room Status | All halls | 30 sec |
| Session Updates | 0 | SKIPPED |
| Session Updates | 1-3 | 30 sec |
| Session Updates | 4+ | 10 sec per page |

Constants

    SLIDE_DURATION_MS = 30000   // Single-page slides
    PAGE_DURATION_MS = 10000    // Multi-page rotation + empty slides

Why This Design

- Single-page slides get 30 seconds - enough time to read from a distance
- Multi-page slides rotate at 10 seconds per page - keeps the total cycle short
- Empty slides show for 10 seconds - quick skip past "no sessions" state
- Session Updates is skipped entirely if no data - matches assignment brief section 8

---

## 14. Live Room Status

The Room Status slide shows live status per lecture hall on the configured floor-side.

Status Values

| Status | Meaning |
|--------|---------|
| ONGOING | A session is happening now |
| FREE | No session scheduled |
| UPCOMING | Session starting soon (within 30 min) |
| CANCELLED | Today's session was cancelled |
| MAINTENANCE | Hall under maintenance |

How It's Calculated

Status is derived from real schedule data + current time - not hard-coded:

- Ongoing = session start <= now <= session end
- Upcoming = session starts within next 30 minutes
- Cancelled = today's session has status='Cancelled'
- Maintenance = hall_status <> 'Active'
- Free = none of the above

---

## 15. Timezone Assumption

All date and time calculations use:

    Asia/Colombo (Sri Lanka Standard Time, UTC+5:30)

This applies to:
- Current time comparisons
- Computed session statuses (Ongoing, Upcoming, Completed)
- Live room statuses
- Cancelled/rescheduled session filtering
- Display clock and countdown timers

The timezone is applied consistently across backend and frontend to avoid skew.

---

## 16. Delete Guard Strategy

To preserve relational data integrity:

Hard deletes on parent entities are blocked if child records exist.

| Entity | Blocked If |
|--------|------------|
| Building | Floors exist |
| Floor | Floor sides exist |
| Floor Side | Halls or displays exist |
| Lecture Hall | Sessions exist |
| Module | Sessions exist |
| Lecturer | Sessions exist |

Response: HTTP 409 Conflict with an explicit error message.

Example:

    {
      "success": false,
      "message": "Cannot delete building: active floors are linked to this building"
    }

---

## 17. Security Implementation

Password Security
- Passwords are never stored as plaintext
- Hashed using bcrypt with salt rounds
- Seeded admin password was hashed via hashAdminPassword.js script

JWT Authentication
- Signed with JWT_SECRET from .env
- Expires after JWT_EXPIRES_IN (default 8h)
- Payload contains: admin_id, email, role
- Verified on every protected route

Protected Routes
- Middleware checks Authorization: Bearer <token>
- Returns 401 Unauthorized on missing/invalid/expired token

Public Routes
- /api/signage/:displayId - no auth (TV displays aren't logged in)
- /api/signage/:displayId/room-status - no auth

Credentials Never Committed
- .env files are in .gitignore
- Only .env.example files are committed (with placeholders)

---

## 18. Local Development Setup

Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- Git
- VS Code (recommended)

Step 1: Clone the Repository

    git clone https://github.com/gamage-recruiters-team409/ScheduleMate-Lecture-Hall-Digital-Signage-System_Kalana.git
    cd ScheduleMate-Lecture-Hall-Digital-Signage-System_Kalana

Step 2: Database Setup

Create the database:

    psql -U postgres
    CREATE DATABASE schedulemate_db;
    \q

Run the schema and seed:

    psql -U postgres -d schedulemate_db -f database/schema.sql
    psql -U postgres -d schedulemate_db -f database/seed.sql
    psql -U postgres -d schedulemate_db -f database/migrations/002_admin_ui_fields.sql
    psql -U postgres -d schedulemate_db -f database/migrations/003_signage_hall_notes.sql

Step 3: Backend Setup

    cd server
    npm install

Create server/.env:

    PORT=5000
    DB_USER=postgres
    DB_PASSWORD=your_postgres_password
    DB_HOST=localhost
    DB_NAME=schedulemate_db
    DB_PORT=5432
    JWT_SECRET=your_jwt_secret_here
    JWT_EXPIRES_IN=8h

Start the backend:

    npm run dev

Server runs at: http://localhost:5000
Test: http://localhost:5000/api/test-db

Step 4: Frontend Setup

    cd client
    npm install

Create client/.env:

    REACT_APP_API_BASE_URL=http://localhost:5000/api

Start the frontend:

    npm start

Frontend runs at: http://localhost:3000

Step 5: Access the Application

| Access Point | URL |
|--------------|-----|
| Admin Panel | http://localhost:3000 |
| Signage Viewer | http://localhost:3000/signage/DSP-0101 |

---

## 19. Environment Variables

Backend (server/.env)

| Variable | Purpose | Example |
|----------|---------|---------|
| PORT | Server port | 5000 |
| DB_USER | PostgreSQL username | postgres |
| DB_PASSWORD | PostgreSQL password | your_password |
| DB_HOST | PostgreSQL host | localhost |
| DB_NAME | Database name | schedulemate_db |
| DB_PORT | PostgreSQL port | 5432 |
| JWT_SECRET | JWT signing secret | your_secret |
| JWT_EXPIRES_IN | Token expiration | 8h |

Frontend (client/.env)

| Variable | Purpose | Example |
|----------|---------|---------|
| REACT_APP_API_BASE_URL | Backend API base URL | http://localhost:5000/api |

Never commit .env files. Use .env.example for templates.

---

## 20. Testing and Verification

Manual API Testing (Postman)

| Test | Expected | Status |
|------|----------|--------|
| Login | 200 + JWT token | Passed |
| Buildings list | 200 + array | Passed |
| Floors list | 200 + array | Passed |
| Sessions list | 200 + computed status | Passed |
| Create session | 201 + row | Passed |
| Create overlapping session | 409 Conflict | Passed |
| Cancel session | 200 + reason saved | Passed |
| Reschedule session | 200 + original_* preserved | Passed |
| Delete building with floors | 409 Conflict | Passed |
| Signage endpoint (no auth) | 200 + session data | Passed |
| Room status endpoint | 200 + per-hall status | Passed |
| Dashboard | 200 + stats | Passed |

Frontend Testing

| Test | Status |
|------|--------|
| Login flow | Passed |
| Dashboard loads stats | Passed |
| Buildings CRUD | Passed |
| Floors CRUD | Passed |
| Lecture Sessions CRUD | Passed |
| Cancel session modal | Passed |
| Reschedule session modal | Passed |
| Conflict error shown | Passed |
| Signage page loads | Passed |
| Slide rotation works | Passed |
| Polling updates data | Passed |
| Room status shows | Passed |

Build Verification

    cd client
    npm run build

Compiles with no errors.

Database Verification

    psql -U postgres -d schedulemate_db
    \dt

All 9 tables + 2 migration columns present.

---

## 21. Git and Branch Workflow

Long-Lived Branches

| Branch | Purpose |
|--------|---------|
| main | Stable, production-ready code |
| develop | Integration branch for all features |

Feature Branch Workflow

    git checkout develop
    git pull origin develop
    git checkout -b feature/your-feature

    # Make changes, then:
    git add .
    git commit -m "feat: your feature description"
    git push origin feature/your-feature

Completed Feature Branches

| Branch | Merged Into | Purpose |
|--------|-------------|---------|
| feature/signage-viewer | develop | Digital Signage Viewer |
| feature/signage-text-size | develop | Card size + text size fixes |
| feature/signage-rotation-timing | develop | Two-tier rotation durations |

Final PR

The final PR from develop to main will be reviewed by:

Sithum Buddhika Jayalal - Team Lead Intern, Software Engineering

---

## 22. Important Assumptions

Documented assumptions applied consistently throughout the system:

1. Room Naming Convention: LH-{Floor}{Side}{Number} (e.g., LH-101 = Lecture Hall, Floor 1, A Side, Room 01). Labs prefixed with LB-.

2. Special Laboratory Floors: Main Building Floors 3, 5, 6 are full lab floors. New Building Floors 3, 10, 12, 13 similarly.

3. Floor 14 (New Building): Only 1 Large Lecture Hall per side (G and F).

4. Timezone: Asia/Colombo (UTC+5:30) - applied to all date/time calculations.

5. Slide Duration:
   - Single-page slides: 30 seconds
   - Multi-page slides: 10 seconds per page
   - Empty Ongoing/Upcoming slides: 10 seconds

6. Polling Interval: 30-60 seconds (configurable per display).

7. Session Status: Never stored - always computed from session_date + start_time + end_time + current time.

8. Rescheduling: Overwrites session_date/start_time/end_time/hall_id and preserves original values in original_* columns.

9. Session Updates Slide: Combines cancelled + rescheduled sessions into one slide.

10. Signage Card Tag Pill: The small feature tag shown on every signage card ("Lecture Session", "Lab Tutorial", "Open Access", "Notify Academic Affairs", "IT Support") is derived deterministically from the card's computed status and the hall's type. It is not stored in the database or randomly generated, so the same status always produces the same label — this keeps the display's behaviour explainable and consistent.

---

## 23. Test Credentials

For demonstration and testing purposes:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sparkline.lk | admin123 |

Note: The password is hashed with bcrypt in the database.

---

## 24. Known Limitations

1. Polling vs Real-Time: Updates are polled every 30-60 seconds. WebSocket real-time updates are not implemented (intentionally - polling is sufficient for this use case).

2. Session Updates Slide: Combines cancelled and rescheduled sessions into one slide (assumption documented - the brief mentions them as separate slides but combining them is a reasonable design decision for the display size).

3. Delete Guards: Parent entities cannot be deleted if child records exist (by design - preserves data integrity).

4. Room Status Pagination: Not implemented - maximum realistic halls per floor-side is 6.

5. Single Admin Role: Only Super Administrator role is implemented (no role hierarchy yet).

---

## 25. Future Enhancements

Potential improvements for future versions:

- WebSocket-based real-time updates (instead of polling)
- Multiple admin roles (Super Admin, Editor, Viewer)
- Emergency announcement override
- Multi-language support
- Mobile app for admin panel
- Advanced analytics dashboard
- Scheduled reports via email
- Integration with existing timetable systems
- Voice announcements for accessibility
- Digital display remote management

---

## License

This project was developed as an individual software engineering assignment for the Internship Program at Gamage Recruiters.

---

## Author

Kalana Dinuja
Software Engineering Intern

Team Lead:
Sithum Buddhika Jayalal
Team Lead - Software Engineering

---

## Acknowledgements

- Team Lead: Sithum Buddhika Jayalal - for guidance and code review
- Gamage Recruiters Team - for the assignment opportunity