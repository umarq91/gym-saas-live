import express from "express";
import { authRoutes } from "./routes/auth.routes";
import { internalRoutes } from "./routes/internal.routes";

import { gymRoutes } from "./routes/gym.routes";
import { feesRoutes } from "./routes/fees.routes";
import { attendanceRoutes } from "./routes/attendance.routes";

import { memberRoutes } from "./routes/member.routes";
import { config } from "./config/envs";
import { globalErrorHandler } from "./middlewares/error-middleware";
import { client } from "./utils/redis";
import cors from "cors";
export const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.listen(config.port, () => {
  // client.connect();
  console.log("Redis connected ");
  console.log("Server started running on port " + config.port);
});

app.use("/internals", internalRoutes);
app.use("/auth", authRoutes);
app.use("/gyms", gymRoutes);
app.use("/members", memberRoutes);
app.use("/fees", feesRoutes);
app.use("/attendance", attendanceRoutes);

app.use(globalErrorHandler);
