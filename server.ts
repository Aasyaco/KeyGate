import express from "express";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import axios from "axios";
import { z } from "zod";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { randomUUID, createHash, timingSafeEqual } from "node:crypto";

// --- SECURITY CONSTANTS ---
const API_KEY_HEADER = "x-api-key";
const MAX_PAYLOAD_SIZE = "50kb";
const PORT = 3000;

// --- SECURITY LOGGING & TRACING ---
const requestLogger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const traceId = randomUUID();
  req.headers["x-trace-id"] = traceId;
  const ip = req.ip || req.socket.remoteAddress;
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - trace: ${traceId} - ip: ${ip?.slice(0, 15)}`);
  next();
};

// --- VALIDATION SCHEMA ---
const TokenRequestSchema = z.object({
  client_id: z.string().trim().max(100).optional().refine(v => !v || /^[a-zA-Z0-9_]{3,64}$/.test(v), "Invalid Client ID format"),
  app_id: z.string().trim().max(100).optional().refine(v => !v || /^\d+$/.test(v), "App ID must be numeric"),
  private_key: z.string().trim().min(50).max(10000).refine(v => v.includes("-----BEGIN RSA PRIVATE KEY-----") && v.includes("-----END RSA PRIVATE KEY-----"), "Invalid PEM structure - Hardware rejection imminent."),
  installation_id: z.string().trim().min(1).max(50).refine(v => /^\d+$/.test(v), "Installation ID must be numeric"),
  requested_ttl: z.number().int().min(300).max(3600).default(3600),
}).refine(data => data.client_id || data.app_id, {
  message: "Either Client ID or App ID is mandatory for cryptographic binding",
  path: ["app_id"],
});

// --- ERROR ARCHITECTURE ---
enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTH_FAILURE = "AUTH_FAILURE",
  CRYPTO_FAILURE = "CRYPTO_FAILURE",
  UPSTREAM_GH_ERROR = "UPSTREAM_GH_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  INTERNAL_GATEWAY_ERROR = "INTERNAL_GATEWAY_ERROR"
}

interface AppErrorResponse {
  code: ErrorCode;
  message: string;
  traceId: string;
  timestamp: string;
}

const sendError = (res: express.Response, status: number, code: ErrorCode, message: string, traceId: string) => {
  const response: AppErrorResponse = {
    code,
    message,
    traceId,
    timestamp: new Date().toISOString()
  };
  return res.status(status).json(response);
};

// --- AUTHENTICATION GATEWAY ---
const authenticateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const traceId = (req.headers["x-trace-id"] as string) || "N/A";
  const providedKey = req.headers[API_KEY_HEADER] as string;
  const expectedHash = process.env.KEYGATE_API_KEY_HASH;

  if (!expectedHash) {
    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
      return sendError(res, 403, ErrorCode.AUTH_FAILURE, "Gateway security misconfigured: Master key missing.", traceId);
    }
    return next(); 
  }

  if (!providedKey) {
    return sendError(res, 401, ErrorCode.AUTH_FAILURE, "Security checkpoint failed: Missing x-api-key header.", traceId);
  }

  try {
    const providedHash = createHash("sha256").update(providedKey).digest("hex");
    const isMatch = timingSafeEqual(Buffer.from(providedHash), Buffer.from(expectedHash));
    
    if (!isMatch) {
      return sendError(res, 401, ErrorCode.AUTH_FAILURE, "Security checkpoint failed: Invalid credentials provided.", traceId);
    }
    next();
  } catch (err) {
    return sendError(res, 500, ErrorCode.INTERNAL_GATEWAY_ERROR, "Authentication engine failure.", traceId);
  }
};

const app = express();

// --- GLOBAL SECURITY HEADROOM ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://github.com"],
      connectSrc: ["'self'", "https://api.github.com", "*"], 
    },
  },
  hsts: false, 
  referrerPolicy: { policy: "no-referrer" },
  frameguard: false, 
  noSniff: true,
  xssFilter: true
}));

app.set('trust proxy', 1);
app.use(requestLogger);
app.use(express.json({ limit: MAX_PAYLOAD_SIZE })); 
app.use(cors({ origin: true, credentials: true }));

// --- RATE LIMITERS ---
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    const traceId = (req.headers["x-trace-id"] as string) || "N/A";
    sendError(res, options.statusCode, ErrorCode.RATE_LIMIT_ERROR, options.message.error, traceId);
  },
  message: { error: "Security throttle engaged: IP-based burst detected." }
});

const apiKeyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => {
    return (req.headers[API_KEY_HEADER] as string) || "unauthenticated";
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    const traceId = (req.headers["x-trace-id"] as string) || "N/A";
    sendError(res, options.statusCode, ErrorCode.RATE_LIMIT_ERROR, options.message.error, traceId);
  },
  message: { error: "Security throttle engaged: API-key usage quota exceeded." }
});

// --- API ROUTES ---
const registerRoutes = () => {
  app.get("/api", (req, res) => {
    res.json({ message: "KeyGate API Gateway is pulse-active.", health: "/api/health" });
  });

  app.get("/api/health", (req, res) => {
    console.log(`[ROUTE_HIT] /api/health from ${req.ip}`);
    res.json({ 
      status: "STABLE", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      vercel: !!process.env.VERCEL
    });
  });

  app.post("/api/generate-token", globalLimiter, authenticateRequest, apiKeyLimiter, async (req, res) => {
    const traceId = (req.headers["x-trace-id"] as string) || randomUUID();
    
    try {
      const validation = TokenRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return sendError(res, 400, ErrorCode.VALIDATION_ERROR, "Protocol validation failed.", traceId);
      }

      const { app_id, client_id, private_key, installation_id, requested_ttl } = validation.data;
      const finalAppId = app_id || client_id;

      const now = Math.floor(Date.now() / 1000);
      const payload = { iat: now - 30, exp: now + 570, iss: finalAppId };

      let jwtToken: string;
      try {
        jwtToken = jwt.sign(payload, private_key, { algorithm: "RS256" });
      } catch (err) {
        return sendError(res, 400, ErrorCode.CRYPTO_FAILURE, "Cryptographic handshake failed.", traceId);
      }

      try {
        const githubResponse = await axios.post(
          `https://api.github.com/app/installations/${installation_id}/access_tokens`,
          {},
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              Accept: "application/vnd.github+json",
              "X-GitHub-Api-Version": "2022-11-28",
              "User-Agent": "KeyGate-Provisioner/1.0.0"
            },
            timeout: 8000 
          }
        );

        return res.status(200).json({
          token: githubResponse.data.token,
          expires_at: githubResponse.data.expires_at,
          expires_in: Math.floor((new Date(githubResponse.data.expires_at).getTime() - Date.now()) / 1000),
          requested_ttl,
          traceId,
          timestamp: new Date().toISOString()
        });

      } catch (githubErr: any) {
        const statusCode = githubErr.response?.status || 502;
        return sendError(res, statusCode, ErrorCode.UPSTREAM_GH_ERROR, "Upstream gateway denied token issuance.", traceId);
      }

    } catch (err: any) {
      return sendError(res, 500, ErrorCode.INTERNAL_GATEWAY_ERROR, "Internal node failure.", traceId);
    }
  });
};

// --- CORE INITIALIZATION ---
async function startBootstrap() {
  const isVercel = !!process.env.VERCEL;
  const isProd = process.env.NODE_ENV === "production";

  console.log(`[BOOT] Environment: ${isProd ? 'Production' : 'Development'} (Vercel: ${isVercel})`);

  // Register API routes first
  registerRoutes();

  if (!isVercel && !isProd) {
    try {
      const { createServer } = await import("vite");
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("[BOOT] Vite Middleware Integrated.");
    } catch (err) {
      console.error("[BOOT] Vite Integration Failed:", err);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    console.log(`[BOOT] Serving Static Content from: ${distPath}`);
    app.use(express.static(distPath));
    
    app.get("*", (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.use((req, res) => {
    if (res.headersSent) return;
    console.warn(`[NOT_FOUND] 404 on ${req.method} ${req.path}`);
    res.status(404).json({
      code: "ROUTE_NOT_FOUND",
      message: `The biological path ${req.path} does not exist.`,
      traceId: req.headers["x-trace-id"] || "N/A",
      timestamp: new Date().toISOString()
    });
  });

  if (!isVercel) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[BOOT] Node listening on 0.0.0.0:${PORT}`);
    });
  }
}

startBootstrap().catch(err => {
  console.error("[CRITICAL] Startup sequence failure:", err);
});

export default app;
