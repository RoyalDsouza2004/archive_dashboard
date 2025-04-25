import { TryCatch } from "./error.js";
import { getConnection } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
import jwt from "jsonwebtoken";
export const isAdmin = TryCatch(async (req, res, next) => {
    const { token } = req.cookies;
    if (!token)
        return next(new ErrorHandler("Unauthorized", 401));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const conn = await getConnection();
    const [user] = await conn.query("SELECT isAdmin FROM user WHERE User_Id = ?", [decoded.id]);
    conn.end();
    if (!user || !user.isAdmin) {
        return next(new ErrorHandler("Forbidden: Admins only", 403));
    }
    next();
});
export const readRoute = TryCatch(async (req, res, next) => {
    const { token } = req.cookies;
    const { publicationId, editionId } = req.query;
    if (!token)
        return next(new ErrorHandler("Unauthorized", 401));
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    if (!id || !publicationId || !editionId) {
        return next(new ErrorHandler("Invalid user or request data", 400));
    }
    const conn = await getConnection();
    const [result] = await conn.query("SELECT permission FROM user_permission WHERE User_Id = ? AND Publication_Id = ? AND Edition_Id = ?", [id, publicationId, editionId]);
    conn.end();
    if (!result || (result.permission !== "r" && result.permission !== "rw")) {
        return next(new ErrorHandler("Access denied: Insufficient permission", 403));
    }
    next();
});
export const writeRoute = TryCatch(async (req, res, next) => {
    const { publicationId, editionId } = req.query;
    const { token } = req.cookies;
    if (!token)
        return next(new ErrorHandler("Unauthorized", 401));
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    if (!id || !publicationId || !editionId) {
        return next(new ErrorHandler("Invalid user or request data", 400));
    }
    const conn = await getConnection();
    const [result] = await conn.query("SELECT permission FROM user_permission WHERE User_Id = ? AND Publication_Id = ? AND Edition_Id = ?", [id, publicationId, editionId]);
    conn.end();
    if (!result || (result.permission !== "w" && result.permission !== "rw")) {
        return next(new ErrorHandler("Access denied: Insufficient permission", 403));
    }
    next();
});
