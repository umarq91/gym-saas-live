"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const envs_1 = require("../config/envs");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield db_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ success: false });
    }
    const valid = yield bcrypt_1.default.compare(password, user.password);
    if (!valid) {
        return res.status(401).json({ success: false });
    }
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        role: user.role,
        gymId: user.gymId,
    }, envs_1.config.jwt_secret, { expiresIn: "7d" });
    res.json({
        success: true,
        token,
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            gymId: user.gymId,
        },
    });
});
exports.login = login;
