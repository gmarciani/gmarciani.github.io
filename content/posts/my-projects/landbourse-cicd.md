---
title: "Personal Project: CI/CD for Landbourse"
description: "How I implemented CI/CD for Landbourse using GitHub Workflows to validate the full-stack build and deploy to Railway."
date: 2028-01-09
draft: true
---

Landbourse is a dockerized monorepo with 14 services: a React frontend, a FastAPI backend, a PostgreSQL database, a Redis cache, an ARQ worker, MinIO object storage, and a full observability stack with Grafana, InfluxDB, Telegraf, and Loki. Every service has its own Dockerfile, its own environment files, and its own health checks. Deploying this by hand is not an option.

I needed a CI/CD pipeline that does two things: validate that the entire stack builds and starts correctly on every push to main, and sync environment variables to Railway so the production environment stays in lockstep with the repository. I built this with four GitHub Workflows that compose together like building blocks.

## The pipeline

The entry point is a single orchestrator workflow that triggers on every push to `main`:

```yaml
name: 🚀 CI/CD Pipeline

on:
  push:
    branches:
      - main

jobs:
  validate-build:
    uses: ./.github/workflows/validate-build.yaml
    secrets: inherit

  update-railway-env:
    needs: validate-build
    uses: ./.github/workflows/update-railway-env.yaml
    secrets: inherit
```

Two stages, sequential. First, validate the build. If that passes, sync environment variables to Railway. The `secrets: inherit` directive forwards all repository secrets to the reusable workflows without listing them one by one. This is important because the number of secrets grows with the number of services, and I did not want to maintain an explicit list.

## Service discovery

With 14 services defined in `docker-compose.yaml`, I did not want to hardcode service names anywhere in the CI configuration. Instead, I built a reusable workflow that discovers services dynamically:

```yaml
- name: Discover services
  id: get-services
  run: |
    services=$(docker compose config --services | sort | jq -Rc '[.,inputs]')
    echo "services=$services" >> $GITHUB_OUTPUT
```

This reads the service list straight from `docker-compose.yaml` and outputs it as a JSON array. Any workflow that needs to iterate over services calls this workflow and gets the current list. When I add or remove a service from the compose file, the pipeline adapts automatically — no workflow edits needed.

## Build validation

The validate-build workflow is the core of the pipeline. It builds every container, starts the full stack, waits for services to stabilize, and then checks health status. If anything is unhealthy, it fails the pipeline and dumps the relevant logs.

The first challenge is secrets. Each service has up to four environment files: `.env.local` and `.env.prod` are committed, while `.env.secrets.local` and `.env.secrets.prod` are gitignored. The CI runner needs the secret files to exist, otherwise Docker Compose refuses to start. I store all local secrets in GitHub Secrets with a naming convention — `LOCAL__API__SECRET_KEY`, `LOCAL__DATABASE__POSTGRES_PASSWORD`, and so on — and a step reconstructs the `.env.secrets.local` files at runtime:

```yaml
- name: Create secret env files
  env:
    SERVICE_SECRETS_JSON: ${{ toJSON(secrets) }}
    SERVICES: ${{ needs.discover-services.outputs.services }}
  run: |
    for service in $(echo "$SERVICES" | jq -r '.[]'); do
      SERVICE_UPPER="$(echo "$service" | tr '[:lower:]-' '[:upper:]_')"
      PREFIX="LOCAL__${SERVICE_UPPER}__"
      SECRETS_FILE="$service/.env.secrets.local"
      : > "$SECRETS_FILE"
      while IFS= read -r secret_key; do
        [ -z "$secret_key" ] && continue
        var_name="${secret_key#"$PREFIX"}"
        value="$(echo "$SERVICE_SECRETS_JSON" | jq -r --arg k "$secret_key" '.[$k]')"
        echo "${var_name}=${value}" >> "$SECRETS_FILE"
      done < <(echo "$SERVICE_SECRETS_JSON" | jq -r --arg p "$PREFIX" 'keys[] | select(startswith($p))')
    done
```

The convention is simple: a secret named `LOCAL__API__JWT_SECRET` becomes `JWT_SECRET=<value>` in `api/.env.secrets.local`. The prefix encodes the environment and the service name. This scales to any number of services and secrets without touching the workflow.

After secrets are in place, the workflow builds and starts everything with the same `make build` and `make start` commands I use locally. Then it waits 120 seconds for services to stabilize — databases need to run init scripts, the API needs to run migrations, health checks need to pass. After that, it inspects every container:

```yaml
- name: Check service health
  run: |
    failed_services=$(docker compose -p landbourse ps --format json | \
      jq -r 'select(
        (.Health != "" and .Health != "healthy") or
        (.State | test("Restarting|Exited"; "i"))
      ) | .Service' | sort -u)

    if [ -z "$failed_services" ]; then
      echo "✓ All services are healthy!"
    else
      echo "✗ Failed services detected:"
      echo "$failed_services" | sed 's/^/  - /'
    fi
```

This catches three failure modes: services with health checks that are not healthy, services that are stuck in a restart loop, and services that have exited. If any service fails, the pipeline dumps the last 200 lines of logs for each failed service — not all services, just the broken ones. This makes debugging fast.

The cleanup step runs unconditionally and tears down everything:

```yaml
- name: Cleanup
  if: always()
  run: |
    docker compose -p landbourse down -v
    docker system prune -af --volumes
```

No leftover volumes, no dangling images. The runner starts clean every time.

## Deploying to Railway

Railway is the hosting platform for Landbourse. Each service in the compose file maps to a Railway service. The deployment itself is handled by Railway's native GitHub integration — when code lands on `main`, Railway detects the change and rebuilds the affected services automatically. What Railway does not handle automatically is environment variable synchronization.

The update-railway-env workflow solves this. It runs after the build validation passes and syncs environment variables from the repository to Railway for every service, using a matrix strategy:

```yaml
strategy:
  fail-fast: false
  matrix:
    service: ${{ fromJSON(needs.discover-services.outputs.services) }}
```

For each service, it collects variables from two sources. First, non-secret variables from the committed `.env.prod` file. Second, secret variables from GitHub Secrets using the `PROD__` prefix convention — `PROD__API__SECRET_KEY` becomes `SECRET_KEY` on the Railway service named `api`.

```yaml
- name: Push env vars to ${{ matrix.service }}
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
    RAILWAY_PROJECT_ID: ${{ secrets.RAILWAY_PROJECT_ID }}
  run: |
    # 1. Non-secret vars from .env.prod
    # 2. Secret vars from GitHub Secrets (PROD__ prefixed)
    railway variables set \
      --service "$SERVICE_NAME" \
      --environment prod \
      "${VARS_ARGS[@]}"
```

The `fail-fast: false` setting is deliberate. If one service fails to sync, the others should still proceed. A partial sync is better than no sync.

## The secret naming convention

The naming convention for secrets is the glue that holds everything together:

| Secret name | Environment | Service | Variable |
|---|---|---|---|
| `LOCAL__API__JWT_SECRET` | local | api | `JWT_SECRET` |
| `LOCAL__DATABASE__POSTGRES_PASSWORD` | local | database | `POSTGRES_PASSWORD` |
| `PROD__API__JWT_SECRET` | prod | api | `JWT_SECRET` |
| `PROD__FRONTEND__API_KEY` | prod | frontend | `API_KEY` |

The pattern is `{ENV}__{SERVICE}__{VAR_NAME}`. The double underscore separates the segments. The workflows parse this convention with `jq` and shell string manipulation to route each secret to the right file or Railway service. Adding a new secret means adding it to GitHub Secrets with the right prefix — no workflow changes required.

## Design decisions

**Reusable workflows over monolithic files.** Each workflow does one thing. The orchestrator composes them. This makes it easy to trigger individual stages manually — I can re-run just the Railway sync with `workflow_dispatch` without rebuilding everything.

**Dynamic service discovery over hardcoded lists.** The `docker-compose.yaml` is the single source of truth for what services exist. The CI pipeline reads from it rather than maintaining a parallel list.

**Convention-based secrets over explicit mapping.** The `LOCAL__` and `PROD__` prefix convention eliminates the need for a configuration file that maps secrets to services. The convention is the configuration.

**Full-stack validation over unit-level checks.** The build validation starts the entire stack and checks health. This catches integration issues — a database migration that breaks the API, a Redis configuration that prevents the worker from connecting, a frontend build that fails because of a missing environment variable. Unit tests and linting run separately; this pipeline validates that the system works as a whole.

**Matrix strategy for Railway sync.** Each service gets its own parallel job. This is faster than sequential processing and isolates failures to individual services.

## What it looks like in practice

A typical CI/CD run on a push to `main`:

1. **Discover services** — reads `docker-compose.yaml`, outputs 14 service names
2. **Create secret env files** — reconstructs `.env.secrets.local` for each service from GitHub Secrets
3. **Build all services** — runs `docker compose build` (no cache in CI)
4. **Start all services** — runs `docker compose up --detach`
5. **Wait 120 seconds** — lets databases initialize, migrations run, health checks pass
6. **Check health** — inspects every container for healthy state
7. **Sync env vars to Railway** — pushes `.env.prod` + `PROD__` secrets to each Railway service in parallel
8. **Railway rebuilds** — Railway detects the new commit and redeploys affected services

The whole pipeline runs in about 10 minutes. Most of that time is Docker builds and the stabilization wait. The Railway sync adds another 2-3 minutes running in parallel across all services.

## Links

- [Landbourse](https://github.com/gmarciani/landbourse)
- [GitHub Actions: Reusable Workflows](https://docs.github.com/en/actions/sharing-automations/reusing-workflows)
- [Railway](https://railway.app)
