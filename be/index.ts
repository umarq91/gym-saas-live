import express from "express";
import { authRoutes } from "./routes/auth.routes";
import { gymRoutes } from "./routes/gym.routes";
import { memberRoutes } from "./routes/member.routes";

export const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/gyms", gymRoutes);
app.use("/members", memberRoutes);
