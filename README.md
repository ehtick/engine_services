# thatopen-services

JavaScript/TypeScript client library and CLI for the ThatOpen platform.

## What's in this repo

- **Library** (`src/core/`) — `EngineServicesClient` for interacting with the ThatOpen API (files, apps, components, projects, executions)
- **CLI** (`src/cli/`) — `thatopen` command for scaffolding, developing, and publishing apps

## Setup

```bash
npm install
npm run build        # Builds both library and CLI
```

## Library

```typescript
import { EngineServicesClient } from 'thatopen-services';

const client = new EngineServicesClient(accessToken, apiUrl);
const files = await client.listFiles();
```

The library builds as both CJS (`dist/index.cjs.js`) and ESM (`dist/index.es.js`).

## CLI

The CLI is available as `thatopen` after install. It has four commands:

| Command | Description |
|---------|-------------|
| `thatopen create <app-name>` | Scaffold a new app project |
| `thatopen dev` | Start local dev server |
| `thatopen login` | Authenticate with the platform |
| `thatopen publish` | Build and publish the app |

### App workflow

```bash
# 1. Create a new app
thatopen create my-app
cd my-app
npm install

# 2. Develop locally
npm run dev

# 3. Authenticate (saves token to local .thatopen file)
npm run login -- --token <your-token> --api-url http://localhost:3000

# 4. First publish (creates the app, auto-saves app ID to .thatopen)
npm run publish

# 5. Subsequent updates (reads app ID from .thatopen)
npm run update
```

### Templates

`thatopen create` supports `--template` to choose the starter:

- `bim` (default) — Three.js + ThatOpen Components + BUI + EngineServicesClient
- `default` — Minimal starter showing app context

### Local dev inside the platform

To test your app inside the platform's iframe:

```bash
thatopen dev --platform
```

This builds in watch mode and serves the bundle over HTTPS at `https://localhost:5174/bundle.js`. In the platform's project view, use the "Local Dev" section to load it.

The first time, you'll need to open `https://localhost:5174/bundle.js` in your browser and accept the self-signed certificate.

### Config files

| File | Scope | Contains |
|------|-------|----------|
| `~/.thatopen/config.json` | Global | `accessToken`, `apiUrl` |
| `.thatopen` (project root) | Per-project, gitignored | `accessToken`, `apiUrl`, `appId` |

The CLI checks the local `.thatopen` first, then falls back to the global config.

## Development (working on this repo)

### Build commands

```bash
npm run build          # Full build (library + CLI)
npm run build:lib      # Library only
npm run build:cli      # CLI only
```

### Testing the CLI locally

```bash
# 1. Link the CLI globally so `thatopen` points to this repo
npm link

# 2. Build CLI and scaffold a test app in temp/test-app
npm run test:cli-build

# 3. Test local dev inside the platform
npm run test:cli-serve
```

`test:cli-build` does:
1. Builds the CLI (`dist/cli.js`)
2. Scaffolds `temp/test-app` with the BIM template
3. Installs dependencies
4. Links the local `thatopen-services` build so the test app uses the repo version

### Testing publish

```bash
cd temp/test-app

# Login with a platform API token
npm run login -- --token <token> --api-url http://localhost:3000

# First publish (creates app, saves app ID to .thatopen)
npm run publish

# Update (publishes new version to same app)
npm run update
```

## How to publish a new version of the library?

- Run `yarn create-version`
- Follow instructions
- Keep in mind the importance of versions (don't release a major for very few non breaking changes)
- Make sure you've got the proper npm token!
- Check that the latest version has been published
