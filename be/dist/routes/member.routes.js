"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberRoutes = void 0;
const express_1 = require("express");
const member_controller_1 = require("../controllers/member.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.memberRoutes = (0, express_1.Router)();
//add gym scoped middleware
exports.memberRoutes.post("/", auth_middleware_1.authMiddleware, member_controller_1.createMember);
