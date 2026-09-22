# Security

## Secrets

Never commit API keys, broker credentials, bot tokens, SMTP passwords, or database credentials. Keep them in environment/secrets storage.

## Current trust boundary

MarketSentry is analysis/alert-only. It has no broker execution capability. Maintain that separation until execution is deliberately designed with explicit authorization and risk controls.

## Network

- PostgreSQL and Redis should remain private to the Docker network.
- Expose the web/API only through HTTPS.
- Restrict CORS in production.
- Add authentication before exposing the dashboard outside a trusted network.
- Rate-limit write/analysis endpoints before public deployment.

## AI

Treat model output as untrusted structured input. `AiDecisionSchema` validates it and the deterministic notification gate applies independent constraints before user notification.

Do not place secrets in AI prompts or provider logs.

## Data retention

Analysis events can reveal trading interests and capital/risk settings. Treat PostgreSQL backups as sensitive application data.
