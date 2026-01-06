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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMember = void 0;
const db_1 = require("../db");
const createMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, phone, email } = req.body;
    const member = yield db_1.prisma.member.create({
        data: {
            name,
            phone,
            email,
            gymId: req.user.gymId,
        },
    });
    res.status(201).json({ success: true, data: member });
});
exports.createMember = createMember;
