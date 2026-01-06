"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    jwt_secret: String(process.env.JWT_SECRET),
    nodeEnv: process.env.NODE_ENV || "development",
};
if (!exports.config.jwt_secret) {
    throw new Error("JWT_SECRET is missing");
}
