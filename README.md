# Arduino IoT Dashboard V2

A full-stack IoT monitoring dashboard built around an Arduino sensor device, an Express/Node.js backend, PostgreSQL, Socket.IO, and a React frontend.

This V2 is a refactor of the original Arduino IoT Dashboard. The goal is to keep the existing frontend experience and Arduino logic while rebuilding the backend with a cleaner architecture and adding authentication, persistence, validation, Docker, and deployment.

## Architecture

```text
                         ┌──────────────────────┐
                         │       Arduino        │
                         │      main.cpp        │
                         │ DHT11 sensor + logic  │
                         └──────────┬───────────┘
                                    │
                             Sensor readings
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       Backend        │
                         │ Node.js + Express    │
                         │                      │
                         │ Routes               │
                         │ Middleware           │
                         │ Controllers          │
                         │ Services             │
                         │ Repositories         │
                         │ Validation           │
                         └──────────┬───────────┘
                                    │
                      ┌─────────────┴─────────────┐
                      │                           │
                      ▼                           ▼
              ┌────────────────┐          ┌───────────────┐
              │   PostgreSQL   │          │   Socket.IO   │
              │ users          │          │ realtime data │
              │ devices        │          │ + updates     │
              │ readings       │          └───────┬───────┘
              │ alerts         │                  │
              └────────────────┘                  │
                                                  ▼
                                        ┌──────────────────┐
                                        │     Frontend     │
                                        │ React + Vite     │
                                        │ Existing UI      │
                                        └──────────────────┘
```

## Repository Structure

```text
arduino-IoT/
├── arduino/
│   └── main.cpp
│
├── backend/
│   ├── controllers/
│   ├── database/
│   │   ├── migrations/
│   │   └── db.ts
│   ├── lib/
│   ├── middleware/
│   ├── repositories/
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   ├── app.ts
│   └── server.ts
│
├── frontend/
│
├── .env
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile.backend
└── Dockerfile.frontend
```

### Component Responsibilities

**`arduino/`**  
Code that runs on the physical Arduino. It remains responsible for reading the DHT11 sensor, applying the existing smoothing/threshold logic, calculating free SRAM, and producing the sensor payload. The Arduino is not containerized. A simulator will be added later so development can continue without physical hardware.

**`backend/routes/`**  
Defines API endpoints such as authentication, device management, readings, and alerts. Routes stay thin and delegate to controllers.

**`backend/middleware/`**  
Request-level checks and cross-cutting behavior. Planned middleware includes user JWT authentication, device-key authentication, error handling, not-found handling, and appropriate security middleware.

**`backend/controllers/`**  
The HTTP layer. Controllers read request data, call services, and return HTTP responses. They should not contain database queries or large amounts of business logic.

**`backend/services/`**  
Business logic. Planned services include authentication, devices, readings, and alerts. Services should not depend on HTTP details.

**`backend/repositories/`**  
Database access. Repositories hide PostgreSQL details from the business logic.

**`backend/database/`**  
PostgreSQL infrastructure. `db.ts` will manage the PostgreSQL connection/pool. Database migrations will live under `migrations/`.

**`backend/schemas/`**  
Validation schemas for incoming request/data payloads. Zod is planned for validation.

**`backend/lib/`**  
Shared technical utilities/infrastructure such as logging and Socket.IO helpers.

**`backend/app.ts`**  
Creates and configures the Express application: global middleware, routes, error handling, and other application setup. It does not start the network listener.

**`backend/server.ts`**  
Starts the configured application and listens on the configured port.

## Backend Request Flow

### Normal authenticated request

```text
React
  ↓
Route
  ↓
Auth Middleware
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
Device Auth Middleware
  ↓
Validation
  ↓
Reading Controller
  ↓
Reading Service
  ├──────────────→ Reading Repository → PostgreSQL
  │
  └──────────────→ Socket.IO → React
```

## Planned API

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

GET    /api/devices
POST   /api/devices
PATCH  /api/devices/:id
DELETE /api/devices/:id

POST /api/devices/:id/regenerate-key

POST /api/devices/:id/readings

GET /api/devices/:id/readings
GET /api/devices/:id/readings/latest

GET /api/devices/:id/alerts
GET /api/devices/:id/alerts/active
```

REST is intended for authentication, device management, history, alerts, and normal request/response operations. Socket.IO is intended for live sensor updates.

## Data Model

Planned PostgreSQL tables:

```text
users
-----
id
email
password_hash
created_at
updated_at

devices
-------
id
user_id
name
device_key_hash
created_at
last_seen_at

sensor_readings
---------------
id
device_id
temperature
humidity
free_ram
temperature_status
humidity_status
recorded_at

alerts
------
id
device_id
type
severity
message
started_at
resolved_at
created_at
```

Relationship:

```text
User
 └── Devices
      ├── Sensor Readings
      └── Alerts
```

## Authentication

There are two separate authentication mechanisms.

### User authentication

```text
User
 ↓
Login
 ↓
Backend verifies password
 ↓
JWT issued
 ↓
React sends Authorization: Bearer <JWT>
```

Passwords will be securely hashed.

### Device authentication

The Arduino will authenticate independently from a user:

```http
X-Device-Key: <device-key>
```

The backend will verify the device key and associate the reading with the correct device.

The raw device key should not be stored directly; the planned design stores a secure hash.

## Arduino Payload

The existing Arduino payload remains the initial device/backend contract:

```json
{
  "t": 25.4,
  "h": 54,
  "r": 12000,
  "status": {
    "ts": 0,
    "hs": 0
  }
}
```

```text
t  → temperature
h  → humidity
r  → free SRAM
ts → temperature status
hs → humidity status
```

The existing frontend has some naming inconsistencies around the memory/status fields. During integration, the goal is to preserve the existing UI while normalizing data at the application boundary rather than redesigning the dashboard.

## Frontend Decision

The existing frontend UI will be kept visually consistent.

The V2 frontend work is mainly integration:

- Connect to the new backend.
- Add authentication handling.
- Retrieve history through REST.
- Consume realtime updates through Socket.IO.
- Adapt data where necessary without redesigning the dashboard.

## Docker

Docker will be used for the application infrastructure.

Planned containers:

```text
Frontend
Backend
PostgreSQL
```

The physical Arduino remains outside Docker.

A future simulator will generate Arduino-compatible readings for development/testing.

## Environment Variables

A single environment configuration is kept at the repository root:

```text
.env
.env.example
```

`.env` contains local/secret values and must not be committed.

`.env.example` documents the variables required to run the project without exposing secrets.

Planned variables include:

```env
PORT=
DATABASE_URL=
JWT_SECRET=
CORS_ORIGIN=
```

The exact variable names can evolve during implementation.

Frontend-exposed environment variables must never contain backend secrets.

## Planned Stack

### Backend

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Socket.IO
- Zod
- JWT authentication
- Secure password hashing
- Docker

### Frontend

- Existing React application
- Existing dashboard UI
- Socket.IO client
- REST API integration

### Arduino

- Existing C++ sensor code
- DHT11
- Existing smoothing/status logic

## Development Order

```text
1. Backend project setup
2. Express application + server
3. PostgreSQL connection
4. Database schema/migrations
5. Repositories
6. Services
7. Controllers + routes
8. Arduino reading ingestion
9. Socket.IO realtime flow
10. User authentication
11. Device authentication
12. Validation + error handling + security
13. Frontend integration
14. Arduino simulator
15. Docker Compose
16. Tests
17. Deployment
18. Final documentation/screenshots
```

## Deployment Plan

Planned production setup:

```text
React frontend
    ↓
Vercel

Express backend
    ↓
Render

PostgreSQL
    ↓
Render PostgreSQL
```

Socket.IO will connect the deployed frontend to the deployed backend for realtime updates.

## Engineering Goals

The V2 is intentionally focused on practical full-stack/backend engineering:

- Clear separation of concerns.
- Persistent relational data.
- User authentication and authorization.
- Device-specific authentication.
- Input validation.
- Realtime communication.
- Dockerized application infrastructure.
- Production deployment.
- Testable architecture.
- Physical IoT hardware integrated with a modern web stack.

The project should avoid unnecessary infrastructure complexity such as microservices, Kafka, Kubernetes, or Redis unless a real requirement appears later.

The goal is a clean, understandable system rather than architecture for its own sake.

## Current Status

The repository structure has been created and initialized with Git.

Initial V2 architecture and technology decisions are documented here.

The next implementation step is backend dependency/setup work followed by the PostgreSQL layer.
