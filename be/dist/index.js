"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const auth_routes_1 = require("./routes/auth.routes");
const gym_routes_1 = require("./routes/gym.routes");
const member_routes_1 = require("./routes/member.routes");
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use("/auth", auth_routes_1.authRoutes);
exports.app.use("/gyms", gym_routes_1.gymRoutes);
exports.app.use("/members", member_routes_1.memberRoutes);
