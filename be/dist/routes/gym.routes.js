"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gymRoutes = void 0;
const express_1 = require("express");
const gym_controller_1 = require("../controllers/gym.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.gymRoutes = (0, express_1.Router)();
// ADD RBAC
exports.gymRoutes.post("/", auth_middleware_1.authMiddleware, gym_controller_1.createGym);
