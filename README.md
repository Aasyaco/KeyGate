# KeyGate

**Enterprise-Grade GitHub App Token Provisioning Gateway**

KeyGate is a high-assurance, stateless gateway designed for secure generation of GitHub App installation access tokens. Built for DevOps engineers, CI/CD pipelines, and security auditors, KeyGate ensures that production credentials never touch persistent storage.

---

## 🏗️ System Architecture

KeyGate operates as a stateless bridge between your private key infrastructure and the GitHub REST API.

### 🔐 Cryptographic Handshake Flow

1.  **JWT Assertion Layer:**
    Upon receiving a valid App ID and Private Key (PEM), KeyGate generates a self-signed JSON Web Token (JWT) using the **RS256** algorithm.
    - **iat (Issued At):** Time-drift compensated (T-30s).
    - **exp (Expiration):** Strictly bound to 10 minutes (GitHub maximum).
    - **iss (Issuer):** Explicit App Identifier.

2.  **Upstream Negotiation:**
    The gateway performs a TLS-secured `POST` request to the GitHub API. GitHub verifies the JWT signature against the public key stored in the App configuration.

3.  **Token Provisioning:**
    GitHub returns an **Installation Access Token (IAT)**. KeyGate passes this token to the requester and immediately zero-fills the signing buffers.

### 🔄 Token Lifecycle
| Asset | Max TTL | Storage |
| :--- | :--- | :--- |
| Private Key | Transient | Volatile Memory Only |
| JWT (Assertion) | 10 Minutes | Volatile Memory Only |
| Access Token | 1 Hour | Client-Side Managed |

---

## 🔐 Security & Compliance Model

KeyGate is engineered with a **Defense-in-Depth** and **Zero-Trust** philosophy.

### 🛡️ Attack Surface Reduction
- **Zero-Persistence:** No databases, Redis instances, or file logs are used for secret storage.
- **Input Sanitization:** All payloads are validated using strict Zod schemas to prevent buffer overruns or injection attacks.
- **Redacted Observability:** Request bodies are never logged. Trace IDs (TR-ID) allow for auditing without exposing sensitive data.
- **Native Crypto:** Uses only the hardened Node.js `crypto` module (via `jsonwebtoken`) for all asymmetric operations.

### 🧩 Compliance Standards
- **No External AI:** Zero usage of LLMs, Gemini APIs, or external AI processing.
- **Privacy Assurance:** No telemetry, tracking pixels, or third-party analytics are embedded.
- **Local Handshakes:** Handshake logic is localized within the isolated compute node.

---

## 📖 API Reference

### POST `/api/generate-token`

Provision a scoped installation access token.

#### Request Schema (JSON)
```json
{
  "app_id": "string (numeric)",
  "client_id": "string (optional)",
  "installation_id": "string (numeric, mandatory)",
  "private_key": "string (PEM format, mandatory)",
  "requested_ttl": "number (seconds, max 3600)"
}
```

#### Response Schema (Success 200)
```json
{
  "token": "ghs_8X...vA2",
  "expires_at": "ISO8601 String",
  "expires_in": 3600,
  "traceId": "UUID String",
  "timestamp": "ISO8601 String"
}
```

#### Error Handling Table
| Code | Status | Description |
| :--- | :--- | :--- |
| `VALIDATION_ERROR` | 400 | Malformed payload or missing IDs. |
| `CRYPTO_FAILURE` | 400 | Incompatible or corrupt Private Key. |
| `UPSTREAM_GH_ERROR` | 403/404 | GitHub rejected the JWT assertion. |
| `RATE_LIMIT_ERROR` | 429 | Security throttle engaged. |

---

## 🚀 Deployment Guide

### Deployment to Vercel / Cloud Run
1.  Initialize repository from source.
2.  Set environment variable `NODE_ENV=production`.
3.  Configure `npm run build` as the build command.
4.  Ensure the server entry point is `tsx server.ts` (dev) or the compiled output for prod.

### Security Notice
**User Responsibility:** While KeyGate processes keys securely, you are responsible for the safety of the keys before submission. Always use HTTPS and ensure your environment is free from root-access compromises.

---

## 📄 License & Terms

Licensed under the **KeyGate Software License 1.0 (Enterprise)**. See the [LICENSE](LICENSE) file for usage restrictions.
Use of the service is subject to the [Terms of Service](src/components/TermsOfService.tsx).

Copyright © 2026 KeyGate Contributors.
