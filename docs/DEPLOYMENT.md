# Deployment

## VPS deployment

Requirements: Docker Engine, Docker Compose plugin, DNS/reverse proxy if exposing the UI/API publicly.

```bash
git clone <repo>
cd MarketSentry
cp .env.example .env
# fill provider credentials and secrets
docker compose up -d --build
```

## Production recommendations

- Do not expose PostgreSQL or Redis ports publicly.
- Put `web` and `api` behind HTTPS through nginx, Caddy, Traefik, or your existing reverse proxy.
- Restrict API CORS to the deployed frontend origin.
- Store `.env` outside version control and use Docker/host secret management where available.
- Back up the PostgreSQL volume. Redis stores active runtime state; PostgreSQL is the durable history source.
- Enable container restart policies and host monitoring before relying on alerts.

## Upgrade flow

```bash
git pull
docker compose build
docker compose up -d
```

Review release notes/config changes before upgrading providers or schema behavior.
