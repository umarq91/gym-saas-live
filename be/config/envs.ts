import dotenv from "dotenv";
dotenv.config();

interface Envs {
  port: number;
  jwt_secret: string;
  nodeEnv: string;
  db_url: string;
}

export const config: Envs = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  jwt_secret: String(process.env.JWT_SECRET),
  nodeEnv: process.env.NODE_ENV || "development",
  db_url: process.env.DATABASE_URL!,
};

if (!config.jwt_secret) {
  throw new Error("JWT_SECRET is missing");
}
