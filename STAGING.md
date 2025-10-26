# Staging deployment (Docker Compose + Cloudflare)

This sets up a production-like staging on a single host using Docker Compose. Two sites are served:

- Internal app (React PWA): exposed on host port 8081
- Public site (React): exposed on host port 8082
- Backend API (Express + PostgreSQL) is isolated on the Docker network and proxied via each frontend at the path `/api` (and `/health`, `/uploads`). No CORS needed.

## Prereqs
- Docker and Docker Compose v2 installed on the server
- A domain on Cloudflare. Either:
  - Use Cloudflare Tunnel to map subdomains to the host ports 8081/8082, or
  - Open ports 80/443 and terminate TLS on a reverse proxy (not covered here)

## One-time setup
1. Copy this repo to the server
2. Create an env file with DB creds (optional; defaults are provided):

```
DB_NAME=psc119_db
DB_USER=psc119
DB_PASS=yourpassword
```

3. Build and start

```
docker compose -f docker-compose.staging.yml up -d --build
```

4. Seed data (optional):

```
docker compose -f docker-compose.staging.yml exec backend node src/scripts/seed.js
```

## Cloudflare Tunnel (recommended)
Create two tunnels or two routes on one tunnel:

- internal.yourdomain.com -> http://localhost:8081
- public.yourdomain.com -> http://localhost:8082

With this, the browser uses HTTPS, the apps are same-origin, and `/api` is transparently proxied to the backend.

## Uploads
File uploads are stored in the `uploads` volume mounted into the backend. Frontends proxy `/uploads/*` to the backend, so URLs remain same-origin.

## Notes
- Frontend API base is already `/api` by default; no change needed.
- Backend CORS is set to `*` here because access is via same-origin proxy. You can restrict it to your staging domains later.
- PostgreSQL is not exposed to the internet; connect via `docker compose exec db psql -U <user> <db>` if needed.

## Tear down

```
docker compose -f docker-compose.staging.yml down
```
