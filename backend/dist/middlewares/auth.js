"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = void 0;
const error_js_1 = require("./error.js");
exports.adminOnly = (0, error_js_1.TryCatch)(async (req, res, next) => {
    next();
});
