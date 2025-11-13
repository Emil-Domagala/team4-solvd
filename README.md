Create a `.env` file in the project root with your local configuration

npm run start:dev:docker

npm run stop:dev:docker

npm run start:dev
# **Project Documentation**

## **APIs**

All endpoints are documented automatically using **Swagger UI**.

**Swagger URL:** `http://localhost:3000/api`

The documentation includes:
- Authentication and authorization flows
- Game control endpoints
- Chat functionality

Refer to Swagger for detailed parameters, examples, and response formats.

---

# **Database Schema**

This section describes the structure of both persistent and transient data used in the application.  
The database (**PostgreSQL via TypeORM**) stores core entities such as **users**, **roles**, **scores**, and **words**, while **Redis** is used for temporary in-memory entities like active rooms, teams, and ongoing games.

---

## **Relational Models (PostgreSQL)**

| Entity | Description | Main Fields | Relationships |
|--------|--------------|--------------|----------------|
| **UserEntity** | Represents a registered user. | `id`, `name`, `email`, `password` | 🔸 `role`: Many users → One role<br>🔸 `score`: One user → One score |
| **RoleEntity** | Defines user permissions or access level. | `id`, `name`, `description` | 🔹 One-to-many with users |
| **ScoreUserEntity** | Stores user game statistics. | `id`, `wins`, `losses`, `draws` | 🔹 One-to-one with user |
| **WordEntity** | Represents available words used in the game. | `id`, `value`, `category`, `difficulty` | — |

---

## **Transient Data Models (Redis)**

Redis stores **volatile** game data and session information used during gameplay via WebSockets.

| Entity | Description | Main Fields | Notes |
|--------|--------------|--------------|-------|
| **RoomEntity** | Represents an active game room. | `id`, `hostId`, `name`, `playerIds`, `teamIds`, `status`, `roomConfig` | Core structure for live rooms and matchmaking. |
| **TeamEntity** | Represents a team within a room. | `id`, `name`, `hostId`, `members` | Created dynamically; not persisted in SQL. |
| **GameEntity** | Represents a running game session. | `id`, `roomId`, `players`, `teams`, `status`, `rounds`, | Tracks state of the ongoing game (rounds, turns, scoring). |

---

## **Enums**

### `WordCategory`
- `general`
- `sports`
- `science`
- `entertainment`
- `history`

### `WordDifficulty`
- `easy`
- `medium`
- `hard`

### `GameStatus`
- `idle`
- `playing`
- `paused`
- `ended`

---

## **Redis Keys**

| Key | Description | Example |
|-----|--------------|----------|
| `room:{roomId}` | Active room session. | `room:12345` |
| `game:{roomId}` | Game instance tied to a room. | `game:12345` |
| `team:{teamId}` | Team configuration within a room. | `team:abcde` |
| `socket:{userId}` | Active socket connection for a user. | `socket:42` |
| `session:{token}` | Authentication/session state. | `session:auth_abc123` |

Each entry stores a serialized JSON object of the corresponding domain entity and a **TTL** (time-to-live) defined by environment variables (`CACHE_TTL`, `AUTH_SESSION_TTL_SEC`, etc.).

---

## 🧪 Testing

### Overview

The project uses **Jest** as the primary testing framework, integrated with **NestJS Testing Module** and **Testcontainers** for integration tests.

To run all:
```bash
npm run test:e2e
```

---

## **Deployment**

This section explains how to set up and deploy the application both for local development and production environments.  
The project runs inside a **Node.js 20 Alpine** container and uses **Docker Compose** to orchestrate **NestJS**, **PostgreSQL**, **Redis**, and **pgAdmin** services.

### **Local Development**

1. Create a .env file at root described as below

2. Install dependencies
    ```bash
    npm install
    ```

3. Run in separate terminals
    ```bash
    npm run start:dev:docker
    npm run start:dev
    ```

To stop and remove containers:
```bash
npm run stop:dev:docker
```

This will build and start all containers defined in docker/docker-compose.yaml using environment variables from .env.

#### Environment Variables

The application uses environment variables to configure database connections, caching, authentication, and runtime behavior.  
These values are loaded automatically from the `.env` file during application startup.

##### Example `.env` File

```env
# Application
NODE_ENV=dev
PORT=3000
FRONTEND_DOMAIN=http://localhost:5173

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=password
DB_NAME=mainDB

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL=60

# Authentication / Sessions
AUTH_SESSION_TTL_SEC=3600
AUTH_SESSION_COOKIE_NAME=authSession

# Admin (pgAdmin)
DB_USERNAME_ADMIN=admin@example.com
DB_PASSWORD_ADMIN=adminpassword
```

#### Variable Reference
| Variable | Description | Example |
|-----------|--------------|----------|
| **NODE_ENV** | Defines the environment mode used by NestJS. | `dev`, `prod`, `test` |
| **PORT** | Port number on which the NestJS server listens. | `3000` |
| **FRONTEND_DOMAIN** | Allowed frontend origin for CORS. | `http://localhost:5173` |
| **DB_HOST** | Host address of the PostgreSQL database. | `localhost` |
| **DB_PORT** | Port number of the PostgreSQL database. | `5432` |
| **DB_USERNAME** | Username used to connect to PostgreSQL. | `admin` |
| **DB_PASSWORD** | Password used to connect to PostgreSQL. | `password` |
| **DB_NAME** | Name of the main PostgreSQL database. | `mainDB` |
| **REDIS_HOST** | Redis server host address. | `localhost` |
| **REDIS_PORT** | Redis server port number. | `6379` |
| **CACHE_TTL** | Default cache Time-To-Live in seconds. | `60` |
| **AUTH_SESSION_TTL_SEC** | Authentication session expiration time (seconds). | `3600` |
| **AUTH_SESSION_COOKIE_NAME** | Cookie name used for authentication sessions. | `authSession` |
| **DB_USERNAME_ADMIN** | Default pgAdmin login email. | `admin@example.com` |
| **DB_PASSWORD_ADMIN** | Default pgAdmin password. | `adminpassword` |

---

## **Future Enhancements**

Ideas for expanding and improving the project:
- New game modes or challenges.  
- Enhanced chat features (voice, emojis, etc.).  
- Global leaderboards or rankings.

---

## **Conclusion**

During the project we've integrated NestJS, PostgreSQL, and Redis to build a scalable, modular, and real-time backend for multiplayer word games.  
The relational database ensures data consistency and persistence for users, roles, scores, and words, while Redis efficiently manages ephemeral entities like rooms, games, and active sessions to enable low-latency interactions.

By separating persistent and transient data layers, the architecture achieves a clear distinction between long-term storage and in-memory state management, improving both performance and maintainability.   
Overall, the system provides a solid foundation for extending gameplay mechanics, analytics, and real-time features in future iterations.

---
