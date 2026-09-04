# Arduino IoT Dashboard V2

A full-stack IoT monitoring system built around a physical Arduino sensor, a TypeScript/Express backend, PostgreSQL, Socket.IO, a React dashboard, a realistic Arduino simulator, and a USB serial bridge for physical-device development.

> **V2 is a production-oriented refactor of the original Arduino IoT Dashboard.**

The original project proved the core idea: an Arduino reads environmental data and a web dashboard displays it in real time. V2 keeps the existing product direction and Arduino logic while rebuilding the backend around a clear, testable architecture with authentication, persistence, validation, device security, Docker, alert lifecycle management, realtime communication, simulation, and physical-device integration.

---

# Why V2?

V2 turns the prototype into a real full-stack system by introducing:

* Layered backend architecture
* PostgreSQL persistence for users, devices, readings, and alerts
* JWT authentication for human users
* Independent device authentication with hashed device keys
* Resource ownership checks
* Runtime request validation with Zod
* Centralized application error handling
* Structured application logging
* Dockerized backend + PostgreSQL development infrastructure
* Sensor-to-alert business logic
* Authenticated Socket.IO connections
* Device-specific Socket.IO rooms
* Realtime reading and alert events
* A realistic stateful Arduino simulator
* Configurable simulator scenarios
* A serial bridge for the physical Arduino
* A clear path to production deployment

The project deliberately stays simple:

> **One backend · one relational database · one frontend · physical IoT hardware**

The system does not introduce microservices, Kafka, Kubernetes, Redis, or other distributed infrastructure without a real requirement.

---

# Architecture

The project has two ways of producing IoT readings:

1. The **real Arduino**, connected to the development computer through USB serial.
2. The **Arduino simulator**, running as a separate Docker service.

Both ultimately use the same backend reading endpoint.

```text
                              ┌──────────────────────┐
                              │     React Dashboard  │
                              │   REST + Socket.IO   │
                              └──────────▲───────────┘
                                         │
                                         │
                    ┌────────────────────┴────────────────────┐
                    │                                         │
                    │             Node.js Backend             │
                    │                                         │
                    │ Express                                  │
                    │ Routes                                   │
                    │ Middleware                               │
                    │ Controllers                              │
                    │ Services                                 │
                    │ Repositories                             │
                    │ Socket.IO                                │
                    │                                         │
                    └──────────────┬───────────┬──────────────┘
                                   │           │
                                   │           │
                                   ▼           ▼
                            ┌───────────┐   Socket.IO
                            │ PostgreSQL│      │
                            └───────────┘      │
                                               ▼
                                        device:<deviceId>


REAL HARDWARE PATH
─────────────────────────────────────────────────────────────

┌──────────────┐
│ Arduino      │
│ DHT11        │
│ main.cpp     │
└──────┬───────┘
       │
       │ USB Serial
       ▼
┌────────────────┐
│ Serial Bridge  │
│ Node + TS      │
└──────┬─────────┘
       │
       │ HTTP
       │ X-Device-Key
       ▼
   Backend API


SIMULATOR PATH
─────────────────────────────────────────────────────────────

┌────────────────────┐
│ Arduino Simulator  │
│ Node + TypeScript  │
│ Docker container   │
└──────────┬─────────┘
           │
           │ HTTP
           │ X-Device-Key
           ▼
       Backend API
```

---

# Request Flows

## User REST request

Not every endpoint requires authentication. Authentication is applied only where the route needs an authenticated user.

```text
React

  ↓

Route

  ↓

authMiddleware (when required)

  ↓

validate(schema) (when required)

  ↓

Controller

  ↓

Service

  ↓

Repository

  ↓

PostgreSQL
```

---

## Arduino reading ingestion

The physical Arduino does not communicate directly with the backend in the current USB development setup.

```text
Arduino
  ↓
USB Serial
  ↓
Serial Bridge
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

---

## Simulator reading ingestion

The simulator behaves as an IoT client and uses the same backend contract as the physical device.

```text
Arduino Simulator
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
  ├── process alerts
  └── update device.last_seen_at
  ↓
PostgreSQL
```

---

## Realtime dashboard flow

After a reading is successfully processed:

```text
Reading Service
  ↓
Socket.IO
  ↓
device:<deviceId>
  ↓
React dashboard
```

Realtime alert events follow the same room-based model.

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

| Layer            | Responsibility                                                                     |
| ---------------- | ---------------------------------------------------------------------------------- |
| **Routes**       | Define API endpoints and compose middleware/controllers                            |
| **Middleware**   | Authentication, device authentication, validation, and error handling              |
| **Controllers**  | Translate HTTP requests into service calls and service results into HTTP responses |
| **Services**     | Business logic and application orchestration                                       |
| **Repositories** | PostgreSQL access and SQL queries                                                  |
| **Schemas**      | Runtime input validation with Zod                                                  |
| **Lib**          | Shared technical utilities such as logging and Socket.IO access                    |
| **Socket**       | Socket.IO authentication and connection/event handling                             |

A useful mental model:

> **Middleware = gatekeeper · Controller = translator · Service = brain · Repository = database interface**

---

## 2. `app.ts` and `server.ts` are intentionally separate

`app.ts` builds and configures the Express application.

`server.ts` creates the HTTP server, attaches Socket.IO, wires the Socket.IO modules together, and starts listening.

This keeps application configuration separate from network startup and makes the Express application easier to test later.

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

For REST users:

```text
req.user.id
```

For authenticated devices:

```text
req.device.id
```

Authorization answers:

> **Are you allowed to access this resource?**

Resource-specific authorization lives in the service layer. User-facing device, reading, and alert operations use ownership-aware repository methods such as:

```text
findByIdAndUser(deviceId, userId)
```

For Socket.IO, the authenticated socket identity is established first, then device ownership is checked before joining a device room.

This prevents a valid user JWT from automatically granting access to every device.

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
invalid                 valid
  ↓                       ↓
400                     next()
```

Schemas currently cover operations such as:

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

* **Zod:** Is the data shaped correctly?
* **Service:** Is this operation allowed and meaningful?

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

The application uses a lightweight logger abstraction rather than scattering raw `console` calls throughout the backend.

The abstraction supports:

```text
info
warn
error
```

The distinction is:

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

A mapping layer can be introduced later if the project grows enough to benefit from explicit DB-to-TypeScript transformation.

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

The same active alert row is maintained while the condition remains active.

Severity changes update the active alert, and returning to normal sets `resolved_at`.

---

## 12. Socket.IO uses authenticated connections and device rooms

Socket.IO is separate from the REST authentication flow while using the same JWT identity model.

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

The room model provides targeted realtime channels:

```text
device:123
device:456
device:789
```

Realtime events are emitted only to the appropriate device room.

Current realtime events include:

```text
reading
alert
```

The `alert` event is emitted for alert creation, severity updates, and alert resolution.

---

## 13. The simulator behaves like an IoT client

The Arduino simulator is intentionally separate from the backend.

It does not bypass:

* device authentication
* request validation
* controllers
* services
* repositories
* PostgreSQL
* alert processing
* realtime event emission

Instead:

```text
Simulator
   ↓
X-Device-Key
   ↓
POST /api/devices/:id/readings
   ↓
real backend pipeline
```

This allows the simulator to exercise the same application path as the real Arduino.

---

## 14. The simulator uses stateful sensor behavior

The simulator does not generate every reading completely independently.

It maintains sensor state and applies gradual changes.

For example:

```text
25.1
25.4
25.7
26.0
26.3
```

is preferred over:

```text
22.1
27.9
23.4
28.0
```

This makes scenario transitions more realistic and allows the backend's alert lifecycle to be tested over time.

Supported scenarios include:

```text
normal
temperature-critical
humidity-high-critical
humidity-low-critical
both-critical
recovery
```

The simulator supports both:

```text
random mode
```

and:

```text
fixed scenario mode
```

Random mode changes scenarios after a configurable duration.

Fixed mode remains on the selected scenario for deterministic testing.

---

## 15. The simulator is a separate development service

The simulator runs independently from the backend and PostgreSQL.

During Docker development:

```text
PostgreSQL
Backend
Simulator
```

are separate services.

This makes the simulator behave like an external IoT client while still remaining convenient to run locally.

---

## 16. The physical Arduino uses USB serial during development

The current Arduino hardware does not contain network hardware.

The Arduino therefore continues to output its JSON reading over USB serial.

A separate Node.js/TypeScript serial bridge reads those lines and forwards valid readings to the backend.

```text
Arduino
   ↓
USB Serial
   ↓
Serial Bridge
   ↓
HTTP POST
   ↓
Backend
```

This keeps the Arduino firmware focused on sensor acquisition while keeping network communication on the host computer.

The bridge uses the same device authentication header:

```text
X-Device-Key: <raw-device-key>
```

and the same reading endpoint:

```text
POST /api/devices/:id/readings
```

The serial bridge is not part of the Docker stack because it needs direct access to the physical serial port.

---

## 17. No unnecessary distributed infrastructure

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
├── simulator/
│   ├── src/
│   │   ├── index.ts
│   │   ├── config.ts
│   │   ├── client.ts
│   │   ├── scenario.ts
│   │   ├── sensor.ts
│   │   └── types.ts
│   │
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
│
├── serial-bridge/
│   ├── src/
│   │   ├── index.ts
│   │   ├── serial.ts
│   │   ├── client.ts
│   │   └── types.ts
│   │
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

* Node.js 22
* TypeScript
* Express.js
* PostgreSQL
* `pg`
* Socket.IO
* Zod
* JWT (`jsonwebtoken`)
* bcrypt
* dotenv
* Helmet
* CORS
* Morgan
* Docker

## Frontend

* React
* Vite
* Socket.IO client
* REST API integration
* Existing dashboard UI

## Simulator

* Node.js
* TypeScript
* `tsx`
* `dotenv`
* Docker

## Serial Bridge

* Node.js
* TypeScript
* `serialport`
* `dotenv`
* `tsx`

## Hardware

* Arduino
* DHT11 temperature/humidity sensor
* Arduino C++ firmware
* USB serial connection

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

Arduino / Simulator uses X-Device-Key

      ↓

device auth middleware

      ↓

bcrypt.compare()

      ↓

req.device.id
```

Regenerating a device key replaces the stored hash and invalidates the previous device credential.

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

REST is used for normal request/response operations such as authentication, device management, history, and alert actions.

Socket.IO is used for realtime notifications.

---

# Socket.IO Events

Authenticated clients communicate through device-specific rooms.

```text
device:<deviceId>
```

Current server-to-client realtime events:

```text
reading
alert
```

### Reading event

Emitted after a reading has been successfully processed.

```text
Reading Service
   ↓
emit("reading", reading)
   ↓
device:<deviceId>
```

### Alert event

Emitted when an alert is:

```text
created
updated
resolved
```

The event payload represents the current alert state.

---

# Arduino

The physical device runs:

```text
arduino/main.cpp
```

The current firmware:

* Reads a DHT11 temperature/humidity sensor
* Smooths sensor values using a small rolling buffer
* Applies persistent warning/critical status logic
* Calculates free SRAM
* Emits a JSON reading approximately every 2 seconds over serial

## Hardware

### DHT11

```text
DHT11 data → Arduino pin 13
```

### USB

The Arduino is connected to the development computer using USB.

USB is used as the serial transport for the current physical-device development workflow.

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

The Arduino outputs this JSON over serial.

The serial bridge reads the JSON and forwards it to:

```text
POST /api/devices/:id/readings
```

The backend validates the payload with Zod before it reaches the controller/service layer.

The service converts status values into the database representation:

```text
normal    → 0
warning   → 1
critical  → 2
```

---

# Arduino Serial Bridge

The serial bridge exists only for the physical Arduino development path.

Its responsibility is:

```text
USB Serial
    ↓
read line
    ↓
parse JSON
    ↓
send HTTP request
```

The bridge ignores non-JSON serial messages such as:

```text
System started...
Sensor error
```

Configuration is provided through the root environment file:

```env
SERIAL_PORT=COM5
SERIAL_BAUD_RATE=9600

BRIDGE_BACKEND_URL=http://localhost:3000

BRIDGE_DEVICE_ID=
BRIDGE_DEVICE_KEY=
```

The bridge runs directly on the host machine because it needs access to the physical serial port.

It is intentionally not part of Docker Compose.

---

# Arduino Simulator

The simulator is a separate TypeScript application and Docker container.

It behaves like an IoT device rather than a backend test utility.

```text
Simulator
    ↓
X-Device-Key
    ↓
POST /api/devices/:id/readings
    ↓
real backend
```

## Simulator scenarios

The simulator supports:

```text
normal
temperature-critical
humidity-high-critical
humidity-low-critical
both-critical
recovery
```

### Normal

Sensor values fluctuate gradually within a normal operating range.

### Temperature critical

Temperature gradually increases through warning and critical thresholds.

### High humidity critical

Humidity gradually increases through warning and critical thresholds.

### Low humidity critical

Humidity gradually decreases through warning and critical thresholds.

### Both critical

Temperature rises while humidity falls, allowing independent temperature and humidity alerts to become active.

### Recovery

The simulator starts in a dangerous state and gradually returns to normal, allowing alert resolution to be tested.

## Simulator modes

The simulator configuration supports:

```text
random
```

or a specific scenario:

```text
temperature-critical
humidity-high-critical
humidity-low-critical
both-critical
recovery
```

Random mode changes scenarios after a configurable duration.

Fixed mode is intended for deterministic testing and debugging.

---

# Local Development

## Prerequisites

* Node.js
* Docker Desktop
* Arduino IDE
* Arduino board + DHT11 for physical-device testing

## Environment configuration

Create the local environment file from the example:

```text
.env.example
    ↓
.env
```

The root `.env` is shared by the Docker stack, simulator, backend, and serial bridge.

Never commit `.env`.

Never expose backend secrets or device keys to the frontend.

Device credentials should remain in the local `.env` file and should not be placed in `.env.example`.

---

## Start the backend stack

From the repository root:

```bash
docker compose up --build
```

The development Docker stack runs:

```text
PostgreSQL
Backend
Arduino Simulator
```

PostgreSQL migrations are initialized from the migration SQL files when the database volume is created.

---

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

---

## Arduino simulator

Create a device through the API and save its returned raw device key.

Then configure:

```env
SIMULATOR_DEVICE_ID=...
SIMULATOR_DEVICE_KEY=...
```

The simulator can then run as part of the Docker Compose stack.

---

## Physical Arduino

Upload:

```text
arduino/main.cpp
```

with the Arduino IDE.

Connect the Arduino to the development computer through USB.

The Arduino outputs sensor JSON through serial at:

```text
9600 baud
```

Configure the serial bridge with the correct COM port:

```env
SERIAL_PORT=COM5
SERIAL_BAUD_RATE=9600

BRIDGE_BACKEND_URL=http://localhost:3000
BRIDGE_DEVICE_ID=...
BRIDGE_DEVICE_KEY=...
```

Then run the bridge from:

```text
serial-bridge/
```

The bridge forwards the physical Arduino readings to the same backend endpoint used by the simulator.

---

## Frontend

The existing dashboard remains visually consistent.

V2 frontend work focuses on:

* user authentication
* protected application state
* device management
* reading history
* live sensor updates
* live alert updates
* Socket.IO integration

---

# Testing / Verification

The backend has been exercised end-to-end against the Dockerized environment.

Verified areas include:

* Docker container startup
* PostgreSQL connectivity and migrations
* Health endpoint
* User registration
* Duplicate registration handling
* Login
* Invalid credentials
* JWT-protected routes
* Zod validation failures
* Device creation
* Device key generation
* Device ownership protection
* Device-key authentication
* Invalid/missing device credentials
* Device-key regeneration
* Sensor reading ingestion
* `last_seen_at` updates
* Latest reading retrieval
* Reading history retrieval
* Reading-driven alert creation
* Active-alert deduplication by device + type
* Alert severity transitions
* Alert resolution
* Repeated-resolution handling
* Multiple alert types on a device
* Alert ownership protection
* Global error handling
* Application logging

Realtime functionality has also been implemented and verified at the backend level:

* Authenticated Socket.IO connections
* JWT verification
* Device-room authorization
* Realtime reading emission
* Realtime alert creation events
* Realtime alert update events
* Realtime alert resolution events

The Arduino simulator has been integrated with the real device endpoint and successfully sends readings at a configurable interval.

The serial bridge has also been implemented so the physical Arduino can use the same backend reading contract through USB serial communication.

---

# Current Implementation Status

```text
Backend project setup                    ✅

Express application + server            ✅

PostgreSQL connection                    ✅

Database schema + migrations             ✅

Repositories                            ✅

Services                                ✅

Middleware                              ✅

Controllers                             ✅

Routes                                  ✅

JWT user authentication                  ✅

Device authentication                    ✅

Zod validation                           ✅

Application error handling               ✅

Logging                                  ✅

Reading → alert lifecycle                ✅

Docker + PostgreSQL development stack    ✅

Backend API verification                 ✅

Socket.IO server                         ✅

Socket.IO JWT authentication             ✅

Socket.IO device-room authorization      ✅

Realtime reading emission                ✅

Realtime alert emission                  ✅

Arduino simulator                        ✅

Simulator random scenarios                ✅

Simulator fixed scenarios                 ✅

Simulator Docker container                ✅

Arduino serial bridge                    ✅

Physical Arduino → backend path          ✅

Frontend V2 integration                   ⏳

Full-stack frontend Docker workflow      ⏳

Production deployment                    ⏳

Automated test suite                     ⏳

Final hardware wiring documentation      ⏳
```

---

# Planned Next Steps

## 1. Integrate the existing React dashboard

Add:

* user authentication
* protected application state
* device management
* reading history
* live sensor updates
* live alert updates
* Socket.IO connection and device-room subscription

The dashboard design will remain visually consistent.

---

## 2. Full-stack Docker Compose

Extend the current Docker development environment to include the frontend so the complete application can be started consistently.

---

## 3. Production deployment

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

The development serial bridge is not a production backend service; it exists to connect USB-connected hardware to the API during local development.

---

## 4. Automated testing

Add automated tests for:

```text
authentication
authorization
validation
device authentication
reading ingestion
alert lifecycle
Socket.IO events
```

---

# Engineering Principles

This project is intentionally built around a few principles:

* Keep responsibilities explicit.
* Keep controllers thin.
* Keep business rules in services.
* Keep SQL inside repositories.
* Validate untrusted input at the boundary.
* Authenticate human users and physical devices independently.
* Enforce resource ownership close to business logic.
* Never expose or log passwords, JWTs, device keys, or password hashes.
* Use REST for normal request/response operations.
* Use Socket.IO for realtime notifications.
* Keep the simulator separate from the backend.
* Make the simulator exercise the real device API.
* Keep the physical Arduino firmware focused on sensing.
* Use a host-side serial bridge when the hardware lacks direct network connectivity.
* Prefer simple architecture over unnecessary infrastructure.
* Preserve working product/UI behavior while improving the backend underneath it.
* Add complexity only when the system has a real reason to need it.

> **Clean architecture, not architecture for architecture's sake.**

---

# Original Project

V2 is a continuation of the original Arduino IoT Dashboard.

The existing UI and Arduino behavior are intentionally preserved as the product foundation while the backend is rebuilt into a more production-oriented system.

The original Arduino firmware remains responsible for:

```text
sensor acquisition
smoothing
status detection
memory measurement
serial JSON output
```

V2 adds the surrounding infrastructure needed to turn that prototype into a complete IoT application.

---

# Status

> **Backend architecture: complete and manually verified.**

> **Realtime infrastructure: implemented, authenticated, authorized, and connected to reading/alert state changes.**

> **Arduino simulation: implemented with realistic stateful scenarios and Docker support.**

> **Physical Arduino integration: implemented through a USB serial bridge using the same device-authenticated reading endpoint.**

> **The next major milestone is integrating the existing React dashboard with the REST and Socket.IO APIs.**
