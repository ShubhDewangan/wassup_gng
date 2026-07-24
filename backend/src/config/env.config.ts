import { getEnv } from "../utils/get-env";

export const Env = {
  NODE_RUN_TYPE: getEnv("NODE_RUN_TYPE", "development"),
  PORT: getEnv("PORT", "8000"),
  MONGO_URI: getEnv("MONGO_URI"),
  JWT_SECRET: getEnv("JWT_SECRET", "secret_jwt"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "15m"),
  NEXT_ORIGIN: getEnv("NEXT_ORIGIN", "http://127.0.0.1:5500/websocket-client-check/index.html"),
  GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CALLBACK_URL: getEnv("GOOGLE_CALLBACK_URL", "http://localhost:3000")
} as const;