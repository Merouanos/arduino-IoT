# Arduino IoT Dashboard V2

A full-stack IoT monitoring system built around a physical Arduino sensor, a TypeScript/Express backend, PostgreSQL, Socket.IO, and a React dashboard.

> **V2 is a production-oriented refactor of the original Arduino IoT Dashboard.**
>
> The original project proved the core idea: an Arduino reads environmental data and a web dashboard displays it in real time. V2 keeps the existing product direction and Arduino logic while rebuilding the backend around a clear, testable architecture with authentication, persistence, validation, device security, Docker, alert lifecycle management, and a realtime communication layer.

---

## Why V2?

V2 turns the prototype into a real full-stack system by introducing:

- Layered backend architecture
- PostgreSQL persistence for users, devices, readings, and alerts
- JWT authentication for human users
- Independent device authentication with hashed device keys
- Resource ownership checks
- Runtime request validation with Zod
- Centralized application error handling
- Structured application logging
- Dockerized backend + PostgreSQL development infrastructure
- Sensor-to-alert business logic
- Socket.IO infrastructure with authenticated user sockets and device-specific rooms
- A clear path to production deployment

The project deliberately stays simple:

> **One backend · one relational database · one frontend · physical IoT hardware**

There are no microservices, Kafka clusters, Kubernetes deployments, or Redis layers unless a real requirement appears later.

---

# Architecture

```text
                                 ┌──────────────────────┐
                                 │       Arduino        │
                                 │      main.cpp        │
                                 │                      │
                                 │   DHT11 + firmware  │
                                 └──────────┬───────────┘
                                            │
                              Device key + sensor readings
                                            │
                                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         Node.js + Express                            │
│                                                                      │
│  Routes → Middleware → Controllers → Services → Repositories         │
│                                                                      │
│                 │                                  │                 │
│                 ▼                                  ▼                 │
│            PostgreSQL                          Socket.IO             │
│        persistent application data         authenticated realtime    │
└───────────────────────┬───────────────────────────┬──────────────────┘
                        │                           │
                        │                           │
                        │                           ▼
                        │                    ┌───────────────┐
                        │                    │   React UI    │
                        │                    │   dashboard   │
                        │                    └───────────────┘
                        │
                        ▼
               users / devices /
               readings / alerts
```

## Request flows

### User REST request

Not every endpoint requires authentication. Authentication is applied only where the route needs an authenticated user.

```text
React
  ↓
Route
  ↓
authMiddleware (when required)
  ↓
validate(schema) (when request data needs validation)
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
PostgreSQL
```

### Arduino reading ingestion

```text
Arduino
  ↓
POST /api/devices/:id/readings
  ↓
deviceAuthMiddleware
  ↓
validate(readingSchema)
  ↓
Reading Controller
  ↓
Reading Service
  ├── save sensor reading
  ├── process temperature alert
  ├── process humidity alert
  └── update device.last_seen_at
  ↓
PostgreSQL
```

### Realtime dashboard flow

```text
Arduino
  ↓
REST reading endpoint
  ↓
Reading Service
  ↓
PostgreSQL
  ↓
Socket.IO
  ↓
device:<deviceId> room
  ↓
React dashboard
```

---

# Architecture Decisions

## 1. Layered backend instead of a monolithic Express file

The backend follows:

```text
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Database
```

Each layer has a narrow responsibility.

| Layer | Responsibility |
|---|---|
| **Routes** | Define API endpoints and compose middleware/controllers |
| **Middleware** | Authentication, device authentication, validation, and error handling |
| **Controllers** | Translate HTTP requests into service calls and service results into HTTP responses |
| **Services** | Business logic and application orchestration |
| **Repositories** | PostgreSQL access and SQL queries |
| **Schemas** | Runtime input validation with Zod |
| **Lib** | Shared technical utilities such as logging and Socket.IO access |
| **Socket** | Socket.IO authentication and connection/event handling |

A useful mental model:

> **Middleware = gatekeeper · Controller = translator · Service = brain · Repository = database interface**

---

## 2. `app.ts` and `server.ts` are intentionally separate

`app.ts` builds and configures the Express application.

`server.ts` creates the HTTP server, attaches Socket.IO, wires the Socket.IO modules together, and starts listening.

This keeps application configuration separate from network startup and makes the Express app easier to test later.

---

## 3. User authentication and device authentication are separate

A human user and a physical Arduino are different security principals.

### Users

```text
email + password
      ↓
bcrypt password verification
      ↓
JWT generated
      ↓
Authorization: Bearer <token>
      ↓
authMiddleware
      ↓
req.user.id
```

### Devices

```text
device creation
      ↓
random device key generated
      ↓
bcrypt hash stored in PostgreSQL
      ↓
raw key returned to the owner
      ↓
X-Device-Key: <raw-key>
      ↓
deviceAuthMiddleware
      ↓
bcrypt.compare()
      ↓
req.device.id
```

A user JWT is never used as an Arduino credential.

---

## 4. Device keys are hashed like passwords

A device key acts as the physical device's credential.

The backend generates the raw credential:

```text
random device key
      ↓
bcrypt
      ↓
device_key_hash
```

Only the hash is stored.

Incoming requests provide the raw key and the backend verifies it with `bcrypt.compare()`.

The raw key is never returned from repository data and should never be logged.

Regenerating a device key replaces the stored hash, which invalidates the previous credential.

---

## 5. Authentication vs. authorization

Authentication answers:

> **Who are you?**

For REST users, that produces:

```text
req.user.id
```

For authenticated devices:

```text
req.device.id
```

Authorization answers:

> **Are you allowed to access this resource?**

Resource-specific authorization lives in the service layer. For example, user-facing device, reading, and alert operations use ownership-aware repository methods such as:

```text
findByIdAndUser(deviceId, userId)
```

For Socket.IO, the authenticated socket identity is established first, then device ownership is checked before joining a device room.

This avoids turning authentication middleware into a collection of resource-specific business rules.

---

## 6. Zod validates at the HTTP boundary

Zod schemas describe what incoming data is allowed to look like.

The reusable validation middleware applies the selected schema:

```text
Request body
    ↓
validate(schema)
    ↓
Zod safeParse()
    ↓
┌───────────┴───────────┐
invalid                valid
  ↓                      ↓
400                    next()
```

The same middleware can be reused with:

```text
registerSchema
loginSchema
updateUserSchema
createDeviceSchema
updateDeviceSchema
readingSchema
createAlertSchema
```

Validation and business rules remain separate:

- **Zod:** Is the data shaped correctly?
- **Service:** Is this operation allowed and meaningful?

---

## 7. Centralized application errors

Expected business errors use the custom `AppError` class:

```text
AppError(message, statusCode)
```

Examples:

```text
400 → invalid application operation
401 → authentication failure
404 → resource not found
409 → duplicate/conflicting operation
```

Unexpected technical failures continue as normal errors and are handled by the global error middleware.

This keeps controllers and services from repeatedly implementing HTTP error responses.

---

## 8. Logging is centralized behind a small abstraction

The application uses a lightweight logger abstraction rather than scattering raw `console` calls everywhere.

The current abstraction supports:

```text
info
warn
error
```

The important distinction is:

```text
INFO
→ successful/normal events

WARN
→ expected rejected or suspicious operations

ERROR
→ unexpected application/system failures
```

Passwords, password hashes, JWTs, device keys, and other secrets are never logged.

---

## 9. Database field naming stays aligned with PostgreSQL

The database uses `snake_case` fields:

```text
password_hash
created_at
updated_at
last_seen_at
device_key_hash
```

The current repository/service implementation uses these names directly instead of introducing a mapping layer prematurely.

That can be introduced later if the project grows enough to benefit from explicit DB-to-TypeScript mapping.

---

## 10. `TIMESTAMPTZ` is used for application timestamps

Application timestamps use:

```sql
TIMESTAMPTZ
```

The schema also intentionally uses `NULL` to represent events that have never happened:

```text
users.updated_at = NULL
→ user has never been updated

devices.last_seen_at = NULL
→ device has never successfully communicated

alerts.resolved_at = NULL
→ alert is still unresolved
```

This gives each timestamp clear domain meaning.

---

## 11. Alert duplication is controlled by device + alert type

The system does not treat a device as having one global active alert.

Instead, an active alert is identified by:

```text
device_id + type + unresolved
```

This allows:

```text
temperature → CRITICAL → active
humidity    → WARNING  → active
```

at the same time.

It also prevents every incoming sensor reading from creating a new alert row.

The alert lifecycle is:

```text
normal
  ↓
warning
  ↓
critical
  ↓
warning
  ↓
normal
```

The same alert row is maintained while the condition remains active. Severity changes update the active alert, and returning to normal sets `resolved_at`.

---

## 12. Socket.IO uses authenticated connections and device rooms

Socket.IO is deliberately kept separate from the REST authentication flow while using the same JWT identity model.

A browser connects with a JWT in the Socket.IO handshake:

```text
React
  ↓
Socket.IO connection
  ↓
socket/auth.ts
  ↓
JWT verification
  ↓
socket.user.id
```

The client can then request access to a device room:

```text
joinDevice(deviceId)
       ↓
verify socket.user.id owns deviceId
       ↓
join device:<deviceId>
```

A valid user JWT does not automatically grant access to every device.

The room model gives the backend a targeted realtime channel:

```text
device:123
device:456
device:789
```

A future reading event can therefore be emitted only to the appropriate room instead of broadcasting unrelated sensor data to every connected client.

---

## 13. No unnecessary distributed infrastructure

The project intentionally avoids microservices, Kafka, Kubernetes, Redis, and similar infrastructure unless a real requirement appears.

The goal is:

> **Clean architecture, not architecture for architecture's sake.**

---

# Repository Structure

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
│   │   │   ├── app.error.ts
│   │   │   ├── logger.ts
│   │   │   └── socket.ts
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
│   │   ├── socket/
│   │   │   ├── auth.ts
│   │   │   └── handler.ts
│   │   │
│   │   ├── types/
│   │   │   ├── express.d.ts
│   │   │   └── socket.d.ts
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
└── README.md
```

---

# Tech Stack

## Backend

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

## Frontend

- React
- Vite
- Existing dashboard UI
- Socket.IO client
- REST API integration

## Hardware

- Arduino
- DHT11 temperature/humidity sensor
- Arduino C++ firmware

---

# Data Model

```text
users

id              UUID PK
email           VARCHAR UNIQUE NOT NULL
password_hash   VARCHAR NOT NULL
created_at      TIMESTAMPTZ NOT NULL
updated_at      TIMESTAMPTZ NULL
```

```text
devices

id                UUID PK
user_id           UUID FK → users.id
name              VARCHAR NOT NULL
device_key_hash   VARCHAR UNIQUE NOT NULL
created_at        TIMESTAMPTZ NOT NULL
last_seen_at      TIMESTAMPTZ NULL
```

```text
sensor_readings

id                   UUID PK
device_id            UUID FK → devices.id
temperature          DOUBLE PRECISION NOT NULL
humidity             DOUBLE PRECISION NOT NULL
free_ram             INTEGER NOT NULL
temperature_status   SMALLINT NOT NULL
humidity_status      SMALLINT NOT NULL
recorded_at          TIMESTAMPTZ NOT NULL
```

```text
alerts

id            UUID PK
device_id     UUID FK → devices.id
type          VARCHAR NOT NULL
severity      VARCHAR NOT NULL
message       VARCHAR NOT NULL
started_at    TIMESTAMPTZ NOT NULL
resolved_at   TIMESTAMPTZ NULL
```

Relationship:

```text
User
 └── Devices
      ├── Sensor Readings
      └── Alerts
```

---

# Authentication

## User authentication

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

Passwords are stored as bcrypt hashes, never as plaintext.

## Device authentication

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

# API Surface

## Authentication

```text
POST  /api/auth/register
POST  /api/auth/login
PATCH /api/auth/me
```

## Devices

```text
GET    /api/devices
POST   /api/devices
GET    /api/devices/:id
PATCH  /api/devices/:id
DELETE /api/devices/:id
POST   /api/devices/:id/regenerate-key
```

## Readings

```text
POST /api/devices/:id/readings
GET  /api/devices/:id/readings
GET  /api/devices/:id/readings/latest
```

## Alerts

```text
POST  /api/devices/:id/alerts
GET   /api/devices/:id/alerts
GET   /api/alerts/:id
PATCH /api/alerts/:id/resolve
```

REST is used for normal request/response operations such as authentication, device management, history, and alert actions. Socket.IO is used for the realtime channel.

---

# Arduino

The physical device runs:

```text
arduino/main.cpp
```

The current firmware:

- Reads a DHT11 temperature/humidity sensor
- Smooths sensor values using a small rolling buffer
- Applies persistent warning/critical status logic
- Calculates free SRAM
- Emits a reading approximately every 2 seconds over serial

## Hardware

### DHT11

```text
DHT11 data → Arduino pin 13
```

### 7-segment display

The 7-segment display was used **only as a development/debugging component** while testing the Arduino board.

It is **not required by the IoT dashboard system**.

---

# Arduino → Backend Payload

The normalized application-level payload is:

```json
{
  "temperature": 25.4,
  "humidity": 54,
  "free_ram": 1200,
  "temperature_status": "normal",
  "humidity_status": "normal"
}
```

Fields:

```text
temperature         → temperature in °C
humidity            → relative humidity in %
free_ram            → free SRAM
temperature_status  → normal / warning / critical
humidity_status     → normal / warning / critical
```

The backend validates the payload with Zod before it reaches the controller/service layer.

The service converts status values into the database representation:

```text
normal   → 0
warning  → 1
critical → 2
```

---

# Local Development

## Prerequisites

- Node.js
- Docker Desktop
- Arduino IDE
- Arduino board + DHT11 for physical-device testing

## Environment configuration

Create the local environment file from the example:

```text
.env.example
    ↓
.env
```

The root `.env` is used by Docker Compose and the backend.

Never commit `.env` or expose backend secrets to the frontend.

## Start the backend stack

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

## Health check

```text
GET http://localhost:3000/health
```

Expected:

```json
{
  "status": "ok"
}
```

## Arduino

Upload:

```text
arduino/main.cpp
```

with the Arduino IDE and connect the board according to the hardware section.

The Arduino remains outside Docker.

A simulator is planned so the complete data pipeline can later be tested without physical hardware.

## Frontend

The existing dashboard remains visually consistent. V2 frontend work focuses on authentication, REST integration, reading history, and Socket.IO realtime updates.

---

# Testing / Verification

The backend has already been exercised end-to-end against the Dockerized environment.

Verified areas include:

- Docker container startup
- PostgreSQL connectivity and migrations
- Health endpoint
- User registration and duplicate registration handling
- Login and invalid credentials
- JWT-protected routes
- Zod validation failures
- Device creation and key generation
- Device ownership protection
- Device-key authentication
- Invalid/missing device credentials
- Device-key regeneration
- Sensor reading ingestion
- `last_seen_at` updates
- Latest/history reading retrieval
- Reading-driven alert creation
- Active-alert deduplication by device + type
- Alert severity transitions
- Alert resolution and repeated-resolution handling
- Multiple alert types on a device
- Alert ownership protection
- Global error handling
- Application logging

The backend is therefore beyond the "server starts" stage: its main API flows have been manually verified against the real Dockerized backend and PostgreSQL environment.

---

# Current Implementation Status

```text
Backend project setup                     ✅
Express application + server             ✅
PostgreSQL connection                     ✅
Database schema + migrations              ✅
Repositories                              ✅
Services                                  ✅
Middleware                                ✅
Controllers                               ✅
Routes                                    ✅
JWT user authentication                   ✅
Device authentication                     ✅
Zod validation                            ✅
Application error handling                ✅
Logging                                   ✅
Reading → alert lifecycle                 ✅
Docker + PostgreSQL development stack     ✅
Backend API verification                  ✅

Socket.IO server                          ✅
Socket.IO JWT authentication              ✅
Socket.IO device-room authorization       ✅
Realtime reading emission                 ⏳
Realtime alert emission                   ⏳
Frontend V2 integration                   ⏳
Arduino simulator                         ⏳
Production deployment                     ⏳
Automated test suite                      ⏳
Final hardware wiring documentation       ⏳
```

---

# Planned Next Steps

## 1. Complete realtime event emission

Once a reading has been processed, emit the relevant sensor and alert events to the authorized device room.

```text
Arduino
  ↓
REST reading endpoint
  ↓
Reading Service
  ↓
PostgreSQL
  ↓
Socket.IO
  ↓
device:<deviceId>
  ↓
React
```

## 2. Integrate the existing React dashboard

Add:

- user authentication
- protected application state
- device management
- reading history
- live sensor updates
- live alert updates

The dashboard design will remain visually consistent.

## 3. Build the Arduino simulator

Generate Arduino-compatible readings so development and automated verification can continue without physical hardware.

The simulator should exercise the same request contract as the real Arduino.

## 4. Full-stack Docker Compose

Extend the current development environment to include the frontend so the complete system can be started consistently.

## 5. Production deployment

Planned direction:

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

# Engineering Principles

This project is intentionally built around a few principles:

- Keep responsibilities explicit.
- Keep controllers thin.
- Keep business rules in services.
- Keep SQL inside repositories.
- Validate untrusted input at the boundary.
- Authenticate human users and physical devices independently.
- Enforce resource ownership close to business logic.
- Never expose or log passwords, JWTs, device keys, or password hashes.
- Use REST for normal request/response operations.
- Use Socket.IO for realtime notifications.
- Prefer simple architecture over unnecessary infrastructure.
- Preserve working product/UI behavior while improving the backend underneath it.
- Add complexity only when the system has a real reason to need it.

> **Clean architecture, not architecture for architecture's sake.**

---

# Original Project

V2 is a continuation of the original Arduino IoT Dashboard.

The existing UI and Arduino behavior are intentionally preserved as the product foundation while the backend is being rebuilt into a more production-oriented system.

---

# Status

> **Backend architecture: complete and manually verified.**
>
> **Realtime infrastructure: implemented, authenticated, and authorized at the device-room level.**
>
> The next milestone is connecting realtime reading/alert events to the React dashboard, followed by the Arduino simulator, full-stack Docker workflow, and production deployment.
