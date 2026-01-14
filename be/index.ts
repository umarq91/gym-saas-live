import express from "express";
import { authRoutes } from "./routes/auth.routes";
import { internalRoutes } from "./routes/internal.routes";

import { gymRoutes } from "./routes/gym.routes";
import { feesRoutes } from "./routes/fees.routes";

import { memberRoutes } from "./routes/member.routes";
import { config } from "./config/envs";

export const app = express();

app.use(express.json());

app.listen(config.port, () => {
  console.log("Server started running on port " + config.port);
});

app.use("/internals", internalRoutes);
app.use("/auth", authRoutes);
app.use("/gyms", gymRoutes);
app.use("/members", memberRoutes);
app.use("/fees", feesRoutes);
