**\*\*# Arduino IoT Dashboard V2\*\***

A full-stack IoT monitoring dashboard built around an Arduino sensor device, an Express/Node.js backend, PostgreSQL, Socket.IO, and a React frontend.

This V2 is a refactor of the original Arduino IoT Dashboard. The goal is to keep the existing frontend experience and Arduino logic while rebuilding the backend with a cleaner architecture and adding authentication, persistence, validation, Docker, and deployment.

**\*\*## Architecture\*\***

\\\`\\\`\\\`text

                         ┌──────────────────────┐

                         │       Arduino        │

                         │      main.cpp        │

                         │ DHT11 sensor + logic  │

                         └──────────┬───────────┘

                                    │

                             Sensor readings

                                    │

                                    ▼

                         ┌──────────────────────┐

                         │       Backend        │

                         │ Node.js + Express    │

                         │                      │

                         │ Routes               │

                         │ Middleware           │

                         │ Controllers          │

                         │ Services             │

                         │ Repositories         │

                         │ Validation           │

                         └──────────┬───────────┘

                                    │

                      ┌─────────────┴─────────────┐

                      │                           │

                      ▼                           ▼

              ┌────────────────┐          ┌───────────────┐

              │   PostgreSQL   │          │   Socket.IO   │

              │ users          │          │ realtime data │

              │ devices        │          │ + updates     │

              │ readings       │          └───────┬───────┘

              │ alerts         │                  │

              └────────────────┘                  │

                                                  ▼

                                        ┌──────────────────┐

                                        │     Frontend     │

                                        │ React + Vite     │

                                        │ Existing UI      │

                                        └──────────────────┘

\\\`\\\`\\\`

**\*\*## Repository Structure\*\***

\\\`\\\`\\\`text

arduino-IoT/

├── arduino/

│   └── main.cpp

│

├── backend/

│   ├── src/

│   │   ├── controllers/

│   │   ├── database/

│   │   │   ├── migrations/

│   │   │   │   ├── users.sql

│   │   │   │   ├── devices.sql

│   │   │   │   ├── sensor\\\_readings.sql

│   │   │   │   └── alerts.sql

│   │   │   ├── db.ts

│   │   │   └── ...

│   │   ├── lib/

│   │   ├── middleware/

│   │   ├── repositories/

│   │   │   ├── user.repository.ts

│   │   │   ├── device.repository.ts

│   │   │   ├── reading.repository.ts

│   │   │   └── alert.repository.ts

│   │   ├── routes/

│   │   ├── schemas/

│   │   │   ├── auth.schema.ts

│   │   │   ├── device.schema.ts

│   │   │   └── reading.schema.ts

│   │   ├── services/

│   │   ├── app.ts

│   │   └── server.ts

│   ├── Dockerfile

│   ├── package.json

│   ├── package-lock.json

│   └── tsconfig.json

│

├── frontend/

│

├── .env

├── .env.example

├── .gitignore

├── docker-compose.yml

└── ...

\\\`\\\`\\\`

**\*\*### Component Responsibilities\*\***

**\*\*\\\*\\\*\\\`arduino/\\\`\\\*\\\*\*\***  

Code that runs on the physical Arduino. It remains responsible for reading the DHT11 sensor, applying the existing smoothing/threshold logic, calculating free SRAM, and producing the sensor payload. The Arduino is not containerized. A simulator will be added later so development can continue without physical hardware.

**\*\*\\\*\\\*\\\`backend/routes/\\\`\\\*\\\*\*\***  

Defines API endpoints such as authentication, device management, readings, and alerts. Routes stay thin and delegate to controllers.

**\*\*\\\*\\\*\\\`backend/middleware/\\\`\\\*\\\*\*\***  

Request-level checks and cross-cutting behavior. Planned middleware includes user JWT authentication, device-key authentication, error handling, not-found handling, and appropriate security middleware.

**\*\*\\\*\\\*\\\`backend/controllers/\\\`\\\*\\\*\*\***  

The HTTP layer. Controllers read request data, call services, and return HTTP responses. They should not contain database queries or large amounts of business logic.

**\*\*\\\*\\\*\\\`backend/services/\\\`\\\*\\\*\*\***  

Business logic. Planned services include authentication, devices, readings, and alerts. Services should not depend on HTTP details.

**\*\*\\\*\\\*\\\`backend/repositories/\\\`\\\*\\\*\*\***  

Database access. Repositories hide PostgreSQL details from the business logic.

**\*\*\\\*\\\*\\\`backend/database/\\\`\\\*\\\*\*\***  

PostgreSQL infrastructure. \\\`db.ts\\\` will manage the PostgreSQL connection/pool. Database migrations will live under \\\`migrations/\\\`.

**\*\*\\\*\\\*\\\`backend/schemas/\\\`\\\*\\\*\*\***  

Validation schemas for incoming request/data payloads. Zod is planned for validation.

**\*\*\\\*\\\*\\\`backend/lib/\\\`\\\*\\\*\*\***  

Shared technical utilities/infrastructure such as logging and Socket.IO helpers.

**\*\*\\\*\\\*\\\`backend/app.ts\\\`\\\*\\\*\*\***  

Creates and configures the Express application: global middleware, routes, error handling, and other application setup. It does not start the network listener.

**\*\*\\\*\\\*\\\`backend/server.ts\\\`\\\*\\\*\*\***  

Starts the configured application and listens on the configured port.

**\*\*## Backend Request Flow\*\***

**\*\*### Normal authenticated request\*\***

\\\`\\\`\\\`text

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

\\\`\\\`\\\`

**\*\*### Arduino reading ingestion\*\***

\\\`\\\`\\\`text

Arduino

  ↓

POST /api/devices/\\\:id/readings

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

\\\`\\\`\\\`

**\*\*## Planned API\*\***

\\\`\\\`\\\`text

POST /api/auth/register

POST /api/auth/login

GET  /api/auth/me

GET    /api/devices

POST   /api/devices

PATCH  /api/devices/\\\:id

DELETE /api/devices/\\\:id

POST /api/devices/\\\:id/regenerate-key

POST /api/devices/\\\:id/readings

GET /api/devices/\\\:id/readings

GET /api/devices/\\\:id/readings/latest

GET /api/devices/\\\:id/alerts

GET /api/devices/\\\:id/alerts/active

\\\`\\\`\\\`

REST is intended for authentication, device management, history, alerts, and normal request/response operations. Socket.IO is intended for live sensor updates.

**\*\*## Data Model\*\***

PostgreSQL tables:

\\\`\\\`\\\`text

users

\\-----

id              UUID PK

email           VARCHAR UNIQUE NOT NULL

password\\\_hash   VARCHAR NOT NULL

created\\\_at      TIMESTAMPTZ NOT NULL

updated\\\_at      TIMESTAMPTZ NULL

devices

\\-------

id              UUID PK

user\\\_id         UUID FK → users.id

name            VARCHAR NOT NULL

device\\\_key\\\_hash VARCHAR UNIQUE NOT NULL

created\\\_at      TIMESTAMPTZ NOT NULL

last\\\_seen\\\_at    TIMESTAMPTZ NULL

sensor\\\_readings

\\---------------

id                  UUID PK

device\\\_id           UUID FK → devices.id

temperature         DOUBLE PRECISION NOT NULL

humidity            DOUBLE PRECISION NOT NULL

free\\\_ram            INTEGER NOT NULL

temperature\\\_status  SMALLINT NOT NULL

humidity\\\_status     SMALLINT NOT NULL

recorded\\\_at         TIMESTAMPTZ NOT NULL

alerts

\\------

id          UUID PK

device\\\_id   UUID FK → devices.id

type        VARCHAR NOT NULL

severity    VARCHAR NOT NULL

message     VARCHAR NOT NULL

started\\\_at  TIMESTAMPTZ NOT NULL

resolved\\\_at TIMESTAMPTZ NULL

\\\`\\\`\\\`\\\`\\\`\\\`

Relationship:

\\\`\\\`\\\`text

User

 └── Devices

      ├── Sensor Readings

      └── Alerts

\\\`\\\`\\\`

**\*\*## Authentication\*\***

There are two separate authentication mechanisms.

**\*\*### User authentication\*\***

\\\`\\\`\\\`text

User

 ↓

Login

 ↓

Backend verifies password

 ↓

JWT issued

 ↓

React sends Authorization: Bearer \\\<JWT>

\\\`\\\`\\\`

Passwords will be securely hashed.

**\*\*### Device authentication\*\***

The Arduino will authenticate independently from a user:

\\\`\\\`\\\`http

X-Device-Key: \\\<device-key>

\\\`\\\`\\\`

The backend will verify the device key and associate the reading with the correct device.

The raw device key should not be stored directly; the planned design stores a secure hash.

**\*\*## Arduino Payload\*\***

The existing Arduino payload remains the initial device/backend contract:

\\\`\\\`\\\`json

{

  "temperature": 25.4,

  "humidity": 54,

  "free\\\_ram": 12000,

  "temperature\\\_status": "normal",

  "humidity\\\_status": "normal"

}

\\\`\\\`\\\`text

temperature         → temperature in °C

humidity            → relative humidity in %

free\\\_ram            → free SRAM

temperature\\\_status  → normal / warning / critical

humidity\\\_status     → normal / warning / critical

\\\`\\\`\\\`

\\\`\\\`\\\`text

t  → temperature

h  → humidity

r  → free SRAM

ts → temperature status

hs → humidity status

\\\`\\\`\\\`

The existing frontend has some naming inconsistencies around the memory/status fields. During integration, the goal is to preserve the existing UI while normalizing data at the application boundary rather than redesigning the dashboard.

**\*\*## Hardware\*\***

The current device is an Arduino-based sensor setup using:

\- **\*\*DHT11\*\*** temperature/humidity sensor

\- **\*\*7-segment display\*\***

\- Arduino C++ firmware in \`arduino/main.cpp\`

Current pin assignments in the firmware:

\`\`\`text

DHT11 data pin → 13

7-segment display:

segment 1 → 2

segment 2 → 3

segment 3 → 4

segment 4 → 5

segment 5 → 6

segment 6 → 7

segment 7 → 8

\`\`\`

The Arduino reads temperature and humidity, applies the existing smoothing and persistent-status logic, calculates free SRAM, and emits a JSON reading every \~2 seconds over the serial connection.

The exact physical wiring diagram and Arduino board model should be documented here once finalized.

**\*\*## Local Setup\*\***

**### Prerequisites**

\- Node.js

\- Docker Desktop

\- Arduino IDE

\- A compatible Arduino board with the DHT11 sensor and 7-segment display

**### Environment**

Copy the example environment file and configure the local values:

\`\`\`text

.env.example

    ↓

.env

\`\`\`

The root \`.env\` is used by Docker Compose and the backend.

**### Run PostgreSQL + Backend**

From the repository root:

\`\`\`bash

docker compose up --build

\`\`\`

Backend health check:

\`\`\`text

http\://localhost:3000/health

\`\`\`

**### Arduino**

Upload \`arduino/main.cpp\` to the board using the Arduino IDE and keep the serial connection configured for the firmware's baud rate.

The Arduino is not containerized. A simulator will be added later for development without physical hardware.

**### Frontend**

The frontend setup will be documented here once the V2 frontend integration is complete, including its local development command and configuration.

**\*\*## Completed So Far\*\***

The initial V2 foundation has now been implemented/configured:

\\- Repository structure created and initialized with Git.

\\- Backend moved under \\\`backend/src/\\\`.

\\- Backend dependencies installed for Express, CORS, Helmet, Morgan, Socket.IO, PostgreSQL, Zod, JWT, bcrypt, dotenv, and TypeScript tooling.

\\- TypeScript configuration fixed for the current TypeScript version.

\\- Backend Dockerfile created using a multi-stage Node 22 Alpine build.

\\- Docker Compose configured with PostgreSQL and backend services.

\\- PostgreSQL runs in its own container with a persistent Docker volume.

\\- Root \\\`.env\\\` and \\\`.env.example\\\` are used for environment configuration.

\\- Express \\\`app.ts\\\`, \\\`server.ts\\\`, and PostgreSQL \\\`db.ts\\\` foundation created.

\\- PostgreSQL schema designed around \\\`users\\\`, \\\`devices\\\`, \\\`sensor\\\_readings\\\`, and \\\`alerts\\\`.

\\- PostgreSQL UUID generation uses \\\`pgcrypto\\\` / \\\`gen\\\_random\\\_uuid()\\\`.

\\- Database timestamps use \\\`TIMESTAMPTZ\\\`.

\\- \\\`NULL\\\` intentionally represents "not happened yet" for:

  - \\\`users.updated\\\_at\\\`

  - \\\`devices.last\\\_seen\\\_at\\\`

  - \\\`alerts.resolved\\\_at\\\`

\\- Application validation schemas created with Zod:

  - \\\`auth.schema.ts\\\`

  - \\\`device.schema.ts\\\`

  - \\\`reading.schema.ts\\\`

\\- Arduino payload updated to use descriptive field names matching the application schema.

\\- Repository layer established for users, devices, readings, and alerts.

\- User repository supports lookup, creation, update, and persistence operations.

\- Device repository supports lookup/ownership checks, creation, update, credential-hash rotation, deletion, key lookup, and last-seen updates.

\- Reading repository supports creating readings and retrieving latest/history readings by device.

\- Alert repository supports creating, retrieving, listing active alerts, and resolving alerts.

**\*\*## Frontend Decision\*\***

The existing frontend UI will be kept visually consistent.

The V2 frontend work is mainly integration:

\\- Connect to the new backend.

\\- Add authentication handling.

\\- Retrieve history through REST.

\\- Consume realtime updates through Socket.IO.

\\- Adapt data where necessary without redesigning the dashboard.

**\*\*## Docker\*\***

Docker will be used for the application infrastructure.

Planned containers:

\\\`\\\`\\\`text

Frontend

Backend

PostgreSQL

\\\`\\\`\\\`

The physical Arduino remains outside Docker.

A future simulator will generate Arduino-compatible readings for development/testing.

**\*\*## Environment Variables\*\***

A single environment configuration is kept at the repository root:

\\\`\\\`\\\`text

.env

.env.example

\\\`\\\`\\\`

\\\`.env\\\` contains local/secret values and must not be committed.

\\\`.env.example\\\` documents the variables required to run the project without exposing secrets.

Planned variables include:

\\\`\\\`\\\`env

PORT=

DATABASE\\\_URL=

JWT\\\_SECRET=

CORS\\\_ORIGIN=

\\\`\\\`\\\`

The exact variable names can evolve during implementation.

Frontend-exposed environment variables must never contain backend secrets.

**\*\*## Planned Stack\*\***

**\*\*### Backend\*\***

\\- Node.js

\\- TypeScript

\\- Express.js

\\- PostgreSQL

\\- Socket.IO

\\- Zod

\\- JWT authentication

\\- Secure password hashing

\\- Docker

**\*\*### Frontend\*\***

\\- Existing React application

\\- Existing dashboard UI

\\- Socket.IO client

\\- REST API integration

**\*\*### Arduino\*\***

\\- Existing C++ sensor code

\\- DHT11

\\- Existing smoothing/status logic

**\*\*## Development Order\*\***

\\\`\\\`\\\`text

1\\. Backend project setup                         ✅

2\\. Express application + server                 ✅

3\\. PostgreSQL connection                         ✅

4\\. Database schema/migrations                    ✅

5\\. Repositories                                  ✅

6\\. Services                                      ⏳

7\\. Controllers + routes                          ⏳

8\\. Arduino reading ingestion                     ⏳

9\\. Socket.IO realtime flow                       ⏳

10\\. User authentication                          ⏳

11\\. Device authentication                        ⏳

12\\. Validation + error handling + security       ⏳

13\\. Frontend integration                         ⏳

14\\. Arduino simulator                            ⏳

15\\. Docker Compose integration                   ✅

16\\. Tests                                        ⏳

17\\. Deployment                                   ⏳

18\\. Final documentation/screenshots              ⏳

\\\`\\\`\\\`

**\*\*## Deployment Plan\*\***

Planned production setup:

\\\`\\\`\\\`text

React frontend

    ↓

Vercel

Express backend

    ↓

Render

PostgreSQL

    ↓

Render PostgreSQL

\\\`\\\`\\\`

Socket.IO will connect the deployed frontend to the deployed backend for realtime updates.

**\*\*## Engineering Goals\*\***

The V2 is intentionally focused on practical full-stack/backend engineering:

\\- Clear separation of concerns.

\\- Persistent relational data.

\\- User authentication and authorization.

\\- Device-specific authentication.

\\- Input validation.

\\- Realtime communication.

\\- Dockerized application infrastructure.

\\- Production deployment.

\\- Testable architecture.

\\- Physical IoT hardware integrated with a modern web stack.

The project should avoid unnecessary infrastructure complexity such as microservices, Kafka, Kubernetes, or Redis unless a real requirement appears later.

The goal is a clean, understandable system rather than architecture for its own sake.

**\*\*## Current Status\*\***

The repository structure has been created and initialized with Git.

The backend foundation, Docker setup, PostgreSQL schema, Zod validation schemas, normalized Arduino payload, and repository layer have now been established.

The next implementation step is the **\*\*\\\*\\\*service layer\\\*\\\*\*\***, starting with authentication and device business logic, followed by controllers/routes and Arduino reading ingestion.