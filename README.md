# Arduino IoT Dashboard V2

A full-stack IoT monitoring system built around a physical Arduino sensor, a TypeScript/Express backend, PostgreSQL, Socket.IO, and a React frontend.

> **V2 is a production-oriented refactor of the original Arduino IoT Dashboard.** The goal is to preserve the existing dashboard experience and Arduino sensor logic while replacing the original backend with a clean, testable architecture and adding authentication, persistence, validation, device security, Docker, and deployment readiness.

---

## Why V2?

The original project proved the core idea: an Arduino reads environmental data and a React dashboard displays it in real time.

V2 turns that prototype into a proper full-stack system by introducing:

- A layered backend architecture
- PostgreSQL persistence for users, devices, readings, and alerts
- User authentication with JWT
- Independent device authentication with hashed device keys
- Request validation with Zod
- Resource ownership checks
- Centralized error handling and logging
- Dockerized backend/database infrastructure
- A clear path to production deployment

The intention is not to add infrastructure for the sake of infrastructure. The system stays deliberately simple: **one backend, one relational database, one frontend, and physical IoT hardware.**

---

## Architecture

```text
                             ┌──────────────────────┐
                             │       Arduino        │
                             │      main.cpp        │
                             │                      │
                             │ DHT11 + sensor logic │
                             └──────────┬───────────┘
                                        │
                              Sensor readings / key
                                        │
                                        ▼
┌───────────────────────────────────────────────────────────────────┐
│                         Node.js + Express                          │
│                                                                   │
│  Routes → Middleware → Controllers → Services → Repositories     │
│                                  │                                │
│                                  ├───────────────┐                │
│                                  ▼               ▼                │
│                              PostgreSQL       Socket.IO            │
└───────────────────────────────────┬───────────────┬────────────────┘
                                    │               │
                                    ▼               ▼
                              Persistent data    Live updates
                                    │               │
                                    └───────┬───────┘
                                            ▼
                                  ┌──────────────────┐
                                  │     React UI     │
                                  │   Existing V2    │
                                  │    dashboard     │
                                  └──────────────────┘
```

### Request flow

#### User request

```text
React
  ↓
Route
  ↓
JWT auth middleware (only when authentication is required)
  ↓
Zod validation (when request data requires validation)
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
PostgreSQL
```

#### Arduino reading ingestion

```text
Arduino
  ↓
POST /api/devices/:id/readings
  ↓
Device-auth middleware
  ↓
Zod reading validation
  ↓
Reading controller
  ↓
Reading service
  ├── save sensor reading
  └── update device last_seen_at
       ↓
   PostgreSQL
```

---

## Architecture Decisions

### 1. Layered backend instead of a monolithic Express file

The backend follows:

```text
Route
  → Middleware
  → Controller
  → Service
  → Repository
  → Database
```

Each layer has one clear responsibility.

| Layer | Responsibility |
|---|---|
| **Routes** | Define HTTP endpoints and compose middleware/controllers |
| **Middleware** | Authentication, device authentication, validation, and error handling |
| **Controllers** | Translate HTTP requests into service calls and service results into HTTP responses |
| **Services** | Business/application logic and orchestration |
| **Repositories** | PostgreSQL access and SQL queries |
| **Schemas** | Runtime request validation with Zod |
| **Lib** | Shared technical utilities such as logging |

A useful mental model is:

> **Middleware = gatekeeper** · **Controller = translator** · **Service = brain** · **Repository = database interface**

---

### 2. `app.ts` and `server.ts` are intentionally separate

`app.ts` builds and configures the Express application.

`server.ts` starts the network listener.

This keeps application configuration independent from server startup and makes the Express app easier to test later.

---

### 3. User authentication and device authentication are separate

A human user and an Arduino are different security principals.

**Users:**

```text
email + password
      ↓
JWT
      ↓
Authorization: Bearer <token>
```

**Devices:**

```text
random device key
      ↓
secure hash stored in PostgreSQL
      ↓
X-Device-Key: <raw-key>
```

A user JWT is never used as an Arduino credential.

---

### 4. Device keys are hashed like passwords

A device key acts as the device's credential. The raw key is generated by the backend and returned when a device is created or its key is regenerated.

Only the hash is stored in PostgreSQL:

```text
Raw device key
      ↓
   bcrypt hash
      ↓
device_key_hash
```

Incoming device requests are verified with `bcrypt.compare()`.

The raw device key is **never returned in repository data and should never be logged**.

---

### 5. Authentication vs. authorization

Authentication middleware answers:

> **Who are you?**

For users, that produces `req.user.id`.

For devices, that produces `req.device.id`.

The service layer handles resource authorization/business rules such as:

> **Are you allowed to access this device?**

For example, reading and alert queries use ownership-aware repository methods such as `findByIdAndUser(...)`.

This keeps middleware generic and keeps resource-specific authorization close to the business logic.

---

### 6. Zod validates at the HTTP boundary

Zod schemas define what incoming data is allowed to look like.

The reusable validation middleware applies the selected schema to `req.body`:

```text
Request body
   ↓
validate(schema)
   ↓
Zod
 ┌─┴─────────┐
invalid     valid
  ↓            ↓
400          next()
```

The same middleware is reusable for authentication, devices, readings, alerts, and future schemas.

---

### 7. Database field naming stays aligned with PostgreSQL for now

The database uses `snake_case` fields such as:

```text
password_hash
created_at
updated_at
last_seen_at
```

The current service/repository implementation uses these names directly. A future cleanup can introduce explicit DB-to-TypeScript mapping if needed, but it is intentionally not adding abstraction prematurely.

---

### 8. `TIMESTAMPTZ` is used for application timestamps

PostgreSQL timestamps use `TIMESTAMPTZ` so stored event times retain timezone-aware semantics.

The project also intentionally uses `NULL` to represent events that have **never happened**:

- `users.updated_at = NULL` → the user has never been updated
- `devices.last_seen_at = NULL` → the device has never successfully communicated
- `alerts.resolved_at = NULL` → the alert is still unresolved

This gives the fields clear domain meaning instead of inventing placeholder timestamps.

---

### 9. Alert duplication is controlled by device + alert type

The system does **not** treat a device as having one global active alert.

Instead, an active alert is checked by:

```text
device_id + type + unresolved
```

This allows a device to have, for example:

```text
temperature → CRITICAL → active
humidity    → WARNING  → active
```

while preventing the same alert type from being recreated on every incoming reading.

---

### 10. No unnecessary distributed infrastructure

The project intentionally avoids microservices, Kafka, Kubernetes, Redis, and similar infrastructure unless a real requirement appears.

The goal is **clean architecture, not architecture for its own sake**.

---

## Repository Structure

```text
arduino-IoT/
│
├── arduino/
│   └── main.cpp
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── device.controller.ts
│   │   │   ├── reading.controller.ts
│   │   │   └── alert.controller.ts
│   │   │
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   │   ├── users.sql
│   │   │   │   ├── devices.sql
│   │   │   │   ├── sensor_readings.sql
│   │   │   │   └── alerts.sql
│   │   │   └── db.ts
│   │   │
│   │   ├── lib/
│   │   │   └── logger.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── deviceAuth.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   └── error.middleware.ts
│   │   │
│   │   ├── repositories/
│   │   │   ├── user.repository.ts
│   │   │   ├── device.repository.ts
│   │   │   ├── reading.repository.ts
│   │   │   └── alert.repository.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── device.routes.ts
│   │   │   ├── reading.routes.ts
│   │   │   └── alert.routes.ts
│   │   │
│   │   ├── schemas/
│   │   │   ├── auth.schema.ts
│   │   │   ├── device.schema.ts
│   │   │   ├── reading.schema.ts
│   │   │   └── alert.schema.ts
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── device.service.ts
│   │   │   ├── reading.service.ts
│   │   │   └── alert.service.ts
│   │   │
│   │   ├── types/
│   │   │   └── express.d.ts
│   │   │
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
│
├── frontend/
│
├── .env
├── .env.example
├── .gitignore
├── docker-compose.yml
└── ...
```

---

## Tech Stack

### Backend

- Node.js 22
- TypeScript
- Express.js
- PostgreSQL
- `pg`
- Socket.IO
- Zod
- JWT (`jsonwebtoken`)
- bcrypt
- dotenv
- Helmet
- CORS
- Morgan
- Docker

### Frontend

- React
- Vite
- Existing dashboard UI
- Socket.IO client
- REST API integration

### Hardware

- Arduino
- DHT11 temperature/humidity sensor
- Arduino C++ firmware

---

## Data Model

```text
users
-----
id              UUID PK
email           VARCHAR UNIQUE NOT NULL
password_hash   VARCHAR NOT NULL
created_at      TIMESTAMPTZ NOT NULL
updated_at      TIMESTAMPTZ NULL


devices
-------
id                UUID PK
user_id           UUID FK → users.id
name              VARCHAR NOT NULL
device_key_hash   VARCHAR UNIQUE NOT NULL
created_at        TIMESTAMPTZ NOT NULL
last_seen_at      TIMESTAMPTZ NULL


sensor_readings
---------------
id                  UUID PK
device_id           UUID FK → devices.id
temperature         DOUBLE PRECISION NOT NULL
humidity            DOUBLE PRECISION NOT NULL
free_ram            INTEGER NOT NULL
temperature_status  SMALLINT NOT NULL
humidity_status     SMALLINT NOT NULL
recorded_at         TIMESTAMPTZ NOT NULL


alerts
------
id          UUID PK
device_id   UUID FK → devices.id
type        VARCHAR NOT NULL
severity    VARCHAR NOT NULL
message     VARCHAR NOT NULL
started_at  TIMESTAMPTZ NOT NULL
resolved_at TIMESTAMPTZ NULL
```

Relationship:

```text
User
└── Devices
    ├── Sensor Readings
    └── Alerts
```

---

## Authentication

### User authentication

```text
email + password
      ↓
 bcrypt verification
      ↓
 JWT generated
      ↓
Authorization: Bearer <JWT>
      ↓
auth middleware
      ↓
req.user.id
```

Passwords are stored as secure bcrypt hashes, never as plaintext.

### Device authentication

```text
Device creation
      ↓
random device key generated
      ↓
bcrypt hash stored in PostgreSQL
      ↓
raw key returned once
      ↓
Arduino uses X-Device-Key
      ↓
device auth middleware
      ↓
bcrypt.compare()
      ↓
req.device.id
```

Regenerating a device key replaces the stored hash, invalidating the previous device credential.

---

## API Surface

### Authentication

```text
POST   /api/auth/register
POST   /api/auth/login
PATCH  /api/auth/me
```

### Devices

```text
GET    /api/devices
POST   /api/devices
GET    /api/devices/:id
PATCH  /api/devices/:id
DELETE /api/devices/:id
POST   /api/devices/:id/regenerate-key
```

### Readings

```text
POST   /api/devices/:id/readings
GET    /api/devices/:id/readings
GET    /api/devices/:id/readings/latest
```

### Alerts

```text
POST   /api/devices/:id/alerts
GET    /api/devices/:id/alerts
GET    /api/alerts/:id
PATCH  /api/alerts/:id/resolve
```

REST is used for normal request/response operations such as authentication, device management, history, and alerts. Socket.IO is reserved for the realtime sensor stream planned for the frontend integration.

---

## Arduino

The physical device runs the existing Arduino C++ logic in:

```text
arduino/main.cpp
```

The current firmware:

- Reads a DHT11 temperature/humidity sensor
- Smooths sensor values using a small rolling buffer
- Applies persistent warning/critical status logic
- Calculates free SRAM
- Emits a reading approximately every 2 seconds over serial

### Sensor connection

```text
DHT11 data → Arduino pin 13
```

### 7-segment display

The 7-segment display was used **only as a development/debugging component** while testing the Arduino board. It is **not required by the IoT dashboard system**.

---

## Arduino → Backend Payload

The normalized application payload is:

```json
{
  "temperature": 25.4,
  "humidity": 54,
  "free_ram": 1200,
  "temperature_status": "normal",
  "humidity_status": "normal"
}
```

The backend validates this payload with Zod before the reading reaches the controller/service layer.

---

## Local Development

### Prerequisites

- Node.js
- Docker Desktop
- Arduino IDE
- Arduino board + DHT11 for physical-device testing

### Environment configuration

Create your local environment file from the example:

```text
.env.example
    ↓
.env
```

The root `.env` is used by Docker Compose and the backend.

Never commit `.env` or expose backend secrets to the frontend.

### Start the backend stack

From the repository root:

```bash
docker compose up --build
```

The current development stack runs:

```text
PostgreSQL
Backend
```

PostgreSQL migrations are initialized from the migration SQL files when the database volume is created.

### Health check

```text
GET http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

### Arduino

Upload `arduino/main.cpp` with the Arduino IDE and connect the board according to the hardware section above.

The Arduino remains outside Docker. A simulator is planned for development and testing without physical hardware.

### Frontend

The existing dashboard will remain visually consistent. V2 frontend work focuses on:

- Authentication handling
- REST API integration
- Reading history
- Socket.IO realtime updates
- Data adaptation without redesigning the dashboard

The frontend's final V2 startup/deployment instructions will be added after integration is complete.

---

## Testing / Verification

The backend has already been exercised end-to-end against the Dockerized environment.

Verified areas include:

- Docker container startup
- PostgreSQL connectivity and migrations
- Health endpoint
- User registration and duplicate registration handling
- Login and invalid credentials
- JWT-protected routes
- Zod validation failures
- Device creation and device key generation
- Device ownership protection
- Device key authentication
- Invalid/missing device credentials
- Device key regeneration
- Sensor reading ingestion
- `last_seen_at` updates
- Latest/history reading retrieval
- Alert creation
- Duplicate active-alert prevention by type
- Multiple alert types per device
- Alert retrieval
- Alert resolution and repeated-resolution handling
- Alert ownership protection
- Global error handling

The repository is therefore beyond the "server starts" stage: the main backend request flows have been manually verified through the actual API and database.

---

## Current Implementation Status

```text
Backend project setup                       ✅
Express application + server               ✅
PostgreSQL connection                       ✅
Database schema + migrations                ✅
Repositories                               ✅
Services                                   ✅
Middleware                                 ✅
Controllers                                ✅
Routes                                     ✅
JWT user authentication                    ✅
Device authentication                      ✅
Zod validation                             ✅
Docker + PostgreSQL development stack      ✅
Backend API verification                   ✅

Arduino simulator                           ⏳
Socket.IO realtime frontend integration    ⏳
Frontend V2 integration                     ⏳
Production deployment                       ⏳
Automated test suite                        ⏳
Final hardware wiring documentation        ⏳
```

---

## Planned Next Steps

### 1. Connect the Arduino to the new backend

Move from API verification to the real serial/device flow and later add the planned simulator.

### 2. Complete realtime integration

Use Socket.IO to stream sensor updates to the existing React dashboard.

### 3. Integrate the frontend with authentication

Add login state, protected UI flows, device management, history, and alert actions.

### 4. Production deployment

Planned architecture:

```text
React frontend → Vercel
        │
        ▼
Express backend → Render
        │
        ▼
PostgreSQL
```

The physical Arduino remains an external IoT client.

---

## Engineering Principles

This project is intentionally built around a few principles:

- Keep responsibilities explicit.
- Keep controllers thin.
- Keep business rules in services.
- Keep SQL inside repositories.
- Validate untrusted input at the boundary.
- Authenticate users and physical devices independently.
- Enforce resource ownership in the business layer.
- Never expose or log passwords, JWTs, device keys, or password hashes.
- Prefer simple architecture over unnecessary infrastructure.
- Preserve working product/UI behavior while improving the backend underneath it.

---

## Original Project

V2 is a continuation of the original Arduino IoT Dashboard project. The original UI and Arduino behavior are intentionally preserved as the foundation while the backend is being rebuilt into a more production-ready system.

---

## Status

**Backend architecture: complete and manually verified.**

The next milestone is integrating the real Arduino/device stream and connecting the React dashboard to the new backend and realtime layer.
