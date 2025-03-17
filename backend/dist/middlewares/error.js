"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TryCatch = exports.errorMiddleware = void 0;
const errorMiddleware = (err, req, res, next) => {
    err.message || (err.message = "Internal Server Error");
    err.statusCode || (err.statusCode = 500);
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
exports.errorMiddleware = errorMiddleware;
const TryCatch = (func) => async (req, res, next) => {
    try {
        await func(req, res, next);
    }
    catch (error) {
        next(error);
    }
};
exports.TryCatch = TryCatch;
