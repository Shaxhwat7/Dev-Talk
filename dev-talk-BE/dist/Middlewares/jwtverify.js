"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = jwtverify;
const SECRET_KEY = process.env.SECRET_KEY || "fallback_key";
function jwtverify(req, res, next) {
    const authHeaders = req.headers["set-cookie"];
}
