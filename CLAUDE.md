# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo shape: two implementations of one API

This repo contains **two parallel implementations** of the same REST API. They are not microservices that talk to each other — they are alternative backends that expose the same endpoints. Whatever you change in one, you almost certainly need to mirror in the other.

- **Java / Spring Boot 3.2 / Maven** — at the repo root (`src/`, `pom.xml`). The original implementation. README.md describes only this side.
- **TypeScript / NestJS / TypeORM** — in `node/`. Port of the Java app, full feature parity intended.

Both serve on **port 8081** by default and share the same Postgres schema (tables `items`, `users`).

## Two functional domains (both backends)

1. **Items CRUD** — `/api/items` (`GET`, `GET/:id`, `POST`, `PUT/:id`, `DELETE/:id`, `GET/health`). Plain CRUD against the `items` table. README documents this.
2. **Phone OTP auth via Firebase** — `/api/auth/verify-otp` only. **Not in the README.** SMS sending is **client-driven**: the frontend calls Firebase Phone Auth (`signInWithPhoneNumber`), Firebase delivers the OTP, the client confirms it and obtains a Firebase ID token, then `POST /api/auth/verify-otp { idToken }` verifies the token via Firebase Admin SDK, upserts the user by `phone_number`, and returns a **Base64(`phone:uuid`) "token"** — this is a placeholder, not a real signed auth token; treat it as such when extending auth logic. There is no server-side `/send-otp` endpoint anymore.

## Non-obvious behaviors (read before changing)

- **Phone normalization is Cambodia-specific.** The frontend's `normalizeCambodiaPhone` (`frontend/lib/firebase.ts`) assumes `+855` country code before passing to Firebase. The backends now trust the `phone_number` claim from the verified Firebase ID token (Firebase always returns E.164), so they no longer normalize themselves. If you're adding multi-country support, the frontend helper is the single point of change.
- **Default user role on first login**: Java sets `EMPLOYEE`; Node leaves `role=null` and auto-promotes to `ADMIN` if `BOOTSTRAP_ADMIN_PHONE` matches. There is no separate signup endpoint — the first successful `verify-otp` for a phone is the implicit registration.
- **`GlobalExceptionHandler` (Java) maps *all* `RuntimeException` → 404.** This is overly broad — any unexpected runtime error in the Java backend currently looks like "not found" to the client. The Node port deliberately does not replicate this; it uses `NotFoundException` explicitly and lets other errors surface as 500. If you tighten the Java handler, the Node port already has the intended behavior to mirror.
- **Firebase Admin is optional at startup.** Both `FirebaseConfig` (Java) and `FirebaseModule` (Node) check `FIREBASE_CREDENTIALS_PATH`; if blank, the app starts normally and `/api/auth/verify-otp` returns `503 Firebase not configured`. This keeps local boot working before the service-account JSON is in place. Don't make Firebase init mandatory at startup — it would break the dev experience.
- **The OTP never touches the server.** Firebase delivers the OTP to the user's phone and verifies it on the client; the backend only sees the resulting ID token. Don't add a server-side OTP store, expiry column, or `/send-otp` route — `users.otp_code` and `users.otp_expired_at` are vestigial columns left over from the Twilio era and are no longer written.
- **DB schema is auto-managed** (`spring.jpa.hibernate.ddl-auto=update` in Java, `synchronize: true` in TypeORM). There are no migrations. Schema changes happen via entity edits, and the running app applies them. This is fine for the current stage but means **prod schema drift is possible** if you change entities without coordinating restarts.

## Commands

### Java backend (root)

```bash
mvn spring-boot:run             # run dev server on :8081
mvn clean package -DskipTests   # build jar (target/crud-api-1.0.0.jar)
java -jar target/crud-api-1.0.0.jar
```

> **There are no tests in this repo** — no `src/test/` directory and no `*.spec.ts` files. `mvn test` and the CI "Run Tests" step both succeed without executing anything. If you're asked to add tests, you're starting from zero (no test infra wired up). Single-test invocations would use `mvn test -Dtest=ClassName#method` (Java) or `npx jest path/to/file.spec.ts` once Jest is added to `node/`.

### Node backend (`node/`)

```bash
cd node
npm install
npm run start:dev               # nest start --watch on :8081
npm run build                   # tsc → dist/
npm run start:prod              # node dist/main.js
```

`.env.example` lists the Node-side env vars. Copy to `.env` before running.

### Docker (Java backend)

```bash
docker build -t crud-api:latest .
docker run -p 8081:8081 crud-api:latest
```

The Dockerfile is **Java-only** — it runs `mvn package` and ships the JAR. There is no Docker setup for the Node port.

## Configuration & environments

- **Local Postgres credentials default to `postgres` / `voleak` / db `crud_api`** — see `src/main/resources/application.properties` and `node/.env.example`. These are dev defaults committed to the repo.
- **Java env override keys**: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` (Spring's standard naming).
- **Node env override key**: single `DATABASE_URL`.
- **Firebase env key** is the same on both sides: `FIREBASE_CREDENTIALS_PATH` — absolute path to the Admin SDK service account JSON. Frontend uses public `NEXT_PUBLIC_FIREBASE_*` vars (defaulted in `frontend/lib/firebase.ts` to project `crud-api-otp`).
- **Render deployment** uses the Java backend with `SPRING_DATASOURCE_URL` pointing at Render's managed Postgres — see RENDER.md for the JDBC URL conversion (`postgres://` → `jdbc:postgresql://`, keep `?sslmode=require`).

## CI

`.github/workflows/ci.yml` builds the **Java** side only on push to `main`/`develop` and on PRs to `main`: `mvn clean install -DskipTests` → `mvn test` (currently a no-op, see Tests note above) → `docker build` → `docker push` to Docker Hub using `DOCKER_USERNAME` / `DOCKER_PASSWORD` secrets. The Node port is not in CI and is not built or published.

## Swagger

Both backends expose:
- Swagger UI at `/swagger-ui.html`
- OpenAPI JSON at `/api-docs`

Configured via `springdoc-openapi` (Java) and `@nestjs/swagger` (Node).
