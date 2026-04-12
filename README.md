# envoy-cli

> A CLI tool to manage, diff, and sync `.env` files across environments with secret redaction support.

---

## Installation

```bash
npm install -g envoy-cli
```

Or with pnpm:

```bash
pnpm add -g envoy-cli
```

---

## Usage

```bash
# Diff two .env files
envoy diff .env.development .env.production

# Sync variables from one environment to another
envoy sync .env.staging .env.production

# Display an .env file with secrets redacted
envoy show .env.production --redact
```

**Example output:**

```
[+] NEW_FEATURE_FLAG=true       (only in production)
[-] DEBUG_MODE=false            (only in development)
[~] DATABASE_URL=***REDACTED*** (changed)
```

---

## Commands

| Command      | Description                                      |
|--------------|--------------------------------------------------|
| `diff`       | Compare two `.env` files and highlight changes   |
| `sync`       | Sync variables from a source to a target file    |
| `show`       | Print an `.env` file with optional secret masking|

---

## License

[MIT](./LICENSE) © 2024 envoy-cli contributors