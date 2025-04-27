import { TryCatch } from "../middlewares/error.js";
import { getConnection, sendCookie } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";

export const addUser = TryCatch(async (req, res, next) => {
    const { email, userName, password, permissions } = req.body;
    if (!email || !userName || !password) {
        return next(new ErrorHandler("Please Provide all fields", 400));
    }
    const conn = await getConnection();
    const [user] = await conn.query("SELECT User_Name FROM user WHERE Email = ?", [email]);
    if (user) {
        return next(new ErrorHandler("User already exist", 404));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuid();
    await conn.query("INSERT INTO user (User_Id, Email, User_Name, Password) VALUES (?, ?, ? ,?)", [
        userId,
        email,
        userName,
        hashedPassword,
    ]);
    if (permissions && permissions.length > 0) {
        const permissionQueries = permissions.map(({ publicationId, editionId, permission }) => {
            return conn.query("INSERT INTO user_permission (User_Id, Publication_Id, Edition_Id, permission) VALUES (?, ?, ?, ?)", [userId, publicationId, editionId, permission]);
        });
        await Promise.all(permissionQueries);
        conn.end();
    }
    return res.status(200).json({
        success: true,
        message: "User Created Successfully",
    });
});
export const loginUser = TryCatch(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler("Please provide email and password", 400));
    }
    const conn = await getConnection();
    const [user] = await conn.query("SELECT * FROM user WHERE Email = ?", [email]);
    if (!user) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }
    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }
    const permissionsResults = await conn.query("SELECT Publication_Id, Edition_Id, permission FROM user_permission WHERE User_Id = ?", [user.User_Id]);
    const permissions = permissionsResults.map((perm) => ({
        publicationId: perm.Publication_Id,
        editionId: perm.Edition_Id,
        permission: perm.permission,
    }));
    sendCookie(user, res, `Welcome back ${user.User_Name}`, 200, permissions);
});
export const getUser = TryCatch(async (req, res, next) => {
    const { userId } = req.params;
    if (!userId) {
        return next(new ErrorHandler("user ID required", 400));
    }
    const conn = await getConnection();
    const [user] = await conn.query("SELECT User_Name, Email FROM user WHERE User_Id = ?", [userId]);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    const permissionsResults = await conn.query("SELECT Publication_Id, Edition_Id, permission FROM user_permission WHERE User_Id = ?", [userId]);
    conn.end();
    const permissions = permissionsResults.map((perm) => ({
        publicationId: perm.Publication_Id,
        editionId: perm.Edition_Id,
        permission: perm.permission
    }));
    return res.status(200).json({
        success: true,
        user: {
            userName: user.User_Name,
            emailId: user.Email,
            permissions: permissions
        }
    });
});

export const addOrUpdateUserPermission = TryCatch(async (req, res, next) => {
    const { userId } = req.params;
    const { permissions } = req.body;
    if (!userId || !permissions || permissions.length === 0) {
        return next(new ErrorHandler("User ID and permissions are required", 400));
    }
    const conn = await getConnection();
    const [user] = await conn.query("SELECT User_Id FROM user WHERE User_Id = ?", [userId]);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    const queries = permissions.map(async ({ publicationId, editionId, permission }) => {
        const [existingPermission] = await conn.query("SELECT permission FROM user_permission WHERE User_Id = ? AND Publication_Id = ? AND Edition_Id = ?", [userId, publicationId, editionId]);
        if (existingPermission) {
            if (existingPermission.permission !== permission) {
                return conn.query("UPDATE user_permission SET permission = ? WHERE User_Id = ? AND Publication_Id = ? AND Edition_Id = ?", [permission, userId, publicationId, editionId]);
            }
        }
        else {
            return conn.query("INSERT INTO user_permission (User_Id, Publication_Id, Edition_Id, permission) VALUES (?, ?, ?, ?)", [userId, publicationId, editionId, permission]);
        }
    });
    await Promise.all(queries);
    conn.end();
    return res.status(200).json({
        success: true,
        message: "Permissions updated successfully",
    });
});
export const getAllUsers = TryCatch(async (req, res, next) => {
    const conn = await getConnection();
    const users = await conn.query("SELECT User_Id, User_Name, Email FROM user");
    const permissionsResults = await conn.query("SELECT User_Id, Publication_Id, Edition_Id, permission FROM user_permission");
    const permissionsMap = {};
    permissionsResults.forEach((perm) => {
        const userId = perm.User_Id;
        if (!permissionsMap[userId]) {
            permissionsMap[userId] = [];
        }
        permissionsMap[userId].push({
            publicationId: perm.Publication_Id,
            editionId: perm.Edition_Id,
            permission: perm.permission,
        });
    });
    const formattedUsers = users.map((user) => ({
        userId: user.User_Id,
        userName: user.User_Name,
        emailId: user.Email,
        permissions: permissionsMap[user.User_Id] || [],
    }));
    return res.status(200).json({
        success: true,
        users: formattedUsers,
    });
});
