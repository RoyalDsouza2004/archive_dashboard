import { TryCatch } from "../middlewares/error.js";
import { getConnection, sendCookie } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";
export const addUser = TryCatch(async (req, res, next) => {
    const { email, userName, password, isAdmin, permissions } = req.body;
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
    await conn.query("INSERT INTO user (User_Id, Email, User_Name, Password , isAdmin) VALUES (?, ?, ? ,? ,?)", [
        userId,
        email,
        userName,
        hashedPassword,
        isAdmin
    ]);
    if (permissions && permissions.length > 0) {
        const permissionQueries = permissions.map(({ publicationId, editionId, permission }) => {
            return conn.query("INSERT INTO user_permission (User_Id, Publication_Id, Edition_Id, permission) VALUES (?, ?, ?, ?)", [userId, publicationId?.toUpperCase(), editionId?.toUpperCase(), permission]);
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
    if (!user.isActive) {
        return next(new ErrorHandler("Please ask Admin to Access again", 404));
    }
    const permissionsResults = await conn.query("SELECT Publication_Id, Edition_Id, permission FROM user_permission WHERE User_Id = ?", [user.User_Id]);
    conn.end();
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
    const [user] = await conn.query("SELECT User_Name, Email , isActive , isAdmin FROM user WHERE User_Id = ?", [userId]);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    const permissionsResults = await conn.query(`SELECT 
            up.Publication_Id, 
            p.Publication_Name, 
            up.Edition_Id, 
            e.Edition_Name, 
            up.permission 
         FROM user_permission up
         JOIN publication p ON up.Publication_Id = p.Publication_Id
         JOIN edition e ON up.Edition_Id = e.Edition_Id
         WHERE up.User_Id = ?`, [userId]);
    const permissions = permissionsResults.map((perm) => ({
        publicationId: perm.Publication_Id,
        publicationName: perm.Publication_Name,
        editionId: perm.Edition_Id,
        editionName: perm.Edition_Name,
        permission: perm.permission
    }));
    return res.status(200).json({
        success: true,
        user: {
            userName: user.User_Name,
            emailId: user.Email,
            isAdmin: user.isAdmin,
            isActive: user.isActive,
            permissions: permissions
        }
    });
});
export const addOrUpdateUserPermission = TryCatch(async (req, res, next) => {
    const { userId } = req.params;
    const { permissions, isAdmin, isActive } = req.body;
    const { token } = req.cookies;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!userId || !permissions || permissions.length === 0) {
        return next(new ErrorHandler("User ID and permissions are required", 400));
    }
    const conn = await getConnection();
    const [user] = await conn.query("SELECT User_Id FROM user WHERE User_Id = ?", [userId]);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    if (!isAdmin && !isActive && decoded.id === userId) {
        await conn.query("UPDATE user SET isAdmin = ?, isActive = ? WHERE User_Id = ?", [isAdmin, isActive, userId]);
        return res
            .status(401)
            .cookie("token", "", { expires: new Date(Date.now()) })
            .json({ authenticated: false });
    }
    await conn.query("UPDATE user SET isAdmin = ?, isActive = ? WHERE User_Id = ?", [isAdmin, isActive, userId]);
    const queries = permissions.map(async ({ publicationId, editionId, permission }) => {
        const [existingPermission] = await conn.query("SELECT permission FROM user_permission WHERE User_Id = ? AND Publication_Id = ? AND Edition_Id = ?", [userId, publicationId, editionId]);
        if (permission === "") {
            return conn.query("DELETE FROM user_permission WHERE User_Id = ? AND Publication_Id = ? AND Edition_Id = ?", [userId, publicationId, editionId]);
        }
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
    const permissionsResults = await conn.query(`SELECT up.User_Id,
            p.Publication_Name, 
            e.Edition_Name, 
            up.permission 
         FROM user_permission up
         JOIN publication p ON up.Publication_Id = p.Publication_Id
         JOIN edition e ON up.Edition_Id = e.Edition_Id
        `);
    const permissionsMap = {};
    permissionsResults.forEach((perm) => {
        const userId = perm.User_Id;
        if (!permissionsMap[userId]) {
            permissionsMap[userId] = [];
        }
        permissionsMap[userId].push({
            publicationName: perm.Publication_Name,
            editionName: perm.Edition_Name,
            permission: perm.permission
        });
    });
    conn.end();
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
export const logout = (req, res, next) => {
    res.status(200).cookie("token", "", {
        expires: new Date(Date.now()),
    }).json({
        success: true,
        message: "logout successfully"
    });
};
