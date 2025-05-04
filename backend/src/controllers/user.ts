import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import { getConnection, sendCookie } from "../utils/features.js";
import { PermissionType, UserType } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken"


export const addUser = TryCatch(async (req: Request<{}, {}, UserType>, res, next) => {

    const { email, userName, password, isAdmin, permissions } = req.body;

    if (!email || !userName || !password) {
        return next(new ErrorHandler("Please Provide all fields", 400))
    }

    const conn = await getConnection();
    const [user] = await conn.query(
        "SELECT User_Name FROM user WHERE Email = ?",
        [email]
    );

    if (user) {
        conn.release()
        return next(new ErrorHandler("User already exist", 404))
    }


    const userId: string = uuid()
    const hashedPassword = await bcrypt.hash(password, 10);

    await conn.query("INSERT INTO user (User_Id, Email, User_Name, Password , isAdmin) VALUES (?, ?, ? ,? ,?)", [
        userId,
        email,
        userName,
        hashedPassword,
        isAdmin
    ]);

    if (permissions && permissions.length > 0) {
        const permissionQueries = permissions.map(({ publicationId, editionId, permission }) => {
            return conn.query(
                "INSERT INTO user_permission (User_Id, Publication_Id, Edition_Id, permission) VALUES (?, ?, ?, ?)",
                [userId, publicationId?.toUpperCase(), editionId?.toUpperCase(), permission]
            );
        });

        await Promise.all(permissionQueries);
    }
    conn.release();

    return res.status(200).json({
        success: true,
        message: "User Created Successfully",
    })

})

export const loginUser = TryCatch(async (req: Request, res, next) => {
    const { email, password ,rememberMe } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please provide email and password", 400));
    }

    const conn = await getConnection();


    const [user] = await conn.query("SELECT * FROM user WHERE Email = ?", [email]);

    if (!user) {
        conn.release()
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
        conn.release()
        return next(new ErrorHandler("Invalid email or password", 401));
    }


    if (!user.isActive) {
        conn.release()
        return next(new ErrorHandler("Please ask Admin to Access again", 404))
    }

    const permissionsResults = await conn.query(
        "SELECT Publication_Id, Edition_Id, permission FROM user_permission WHERE User_Id = ?",
        [user.User_Id]
    );

    conn.release()

    const permissions = permissionsResults.map((perm: any) => ({
        publicationId: perm.Publication_Id,
        editionId: perm.Edition_Id,
        permission: perm.permission,
    }));

    if(rememberMe){
        sendCookie(user, res, `Welcome back ${user.User_Name}`, 200, permissions);
    }

    return res.status(200).json({
        success: true,
        userName: user.User_Name,
        isAdmin:user.isAdmin,
        message:`Welcome back ${user.User_Name}`,
        permissions
  });


});

export const getUser = TryCatch(async (req, res, next) => {
    const { userId } = req.params;

    if (!userId) {
        return next(new ErrorHandler("user ID required", 400))
    }

    const conn = await getConnection();

    const [user] = await conn.query(
        "SELECT User_Name, Email , isActive , isAdmin FROM user WHERE User_Id = ?",
        [userId]
    );

    if (!user) {
        conn.release()
        return next(new ErrorHandler("User not found", 404))
    }

    const permissionsResults = await conn.query(
        `SELECT 
            up.Publication_Id, 
            p.Publication_Name, 
            up.Edition_Id, 
            e.Edition_Name, 
            up.permission 
         FROM user_permission up
         JOIN publication p ON up.Publication_Id = p.Publication_Id
         JOIN edition e ON up.Edition_Id = e.Edition_Id
         WHERE up.User_Id = ?`,
        [userId]
    );
    conn.release()

    const permissions: PermissionType[] = permissionsResults.map((perm: any) => ({
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

})

export const addOrUpdateUserPermission = TryCatch(async (req: Request<{ userId?: string }, {}, { permissions: PermissionType[], isAdmin: boolean, isActive: boolean, emailId?: string, password?: string }>, res, next) => {

    const { userId } = req.params;
    const { permissions, isAdmin, isActive, emailId, password } = req.body;
    const { token } = req.cookies;

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string, userName: string, isAdmin: boolean }

    if (!userId) {
        return next(new ErrorHandler("User ID is required", 400));
    }

    const conn = await getConnection();

    const [user] = await conn.query(
        "SELECT User_Id, Email FROM user WHERE User_Id = ?",
        [userId]
    );

    if (!user) {
        conn.release()
        return next(new ErrorHandler("User not found", 404));
    }

    if (emailId !== user.Email) {
        const [emailExists] = await conn.query("SELECT * FROM user WHERE Email = ?", [emailId]);
        if (emailExists) {
            return next(new ErrorHandler("Email is already taken", 400));
        }
        await conn.query("UPDATE user SET Email = ? WHERE User_Id = ?", [emailId, userId]);
        conn.release()
    }

    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await conn.query("UPDATE user SET Password = ? WHERE User_Id = ?", [hashedPassword, userId]);
        conn.release()
    }


    if (!isAdmin && !isActive && decoded.id === userId) {
        await conn.query("UPDATE user SET isAdmin = ?, isActive = ? WHERE User_Id = ?", [isAdmin, isActive, userId]);
        conn.release()

        return res
            .status(401)
            .cookie("token", "", { expires: new Date(Date.now()) })
            .json({ authenticated: false });
    }
    

    await conn.query("UPDATE user SET isAdmin = ?, isActive = ? WHERE User_Id = ?", [isAdmin, isActive, userId]);

    if (!permissions || permissions.length === 0) {
        conn.release();
        return res.status(200).json({
            success: true,
            message: "User updated successfully (no permission changes)",
        });
    }


    const queries = permissions.map(async ({ publicationId, editionId, permission }) => {

        const [existingPermission] = await conn.query(
            "SELECT permission FROM user_permission WHERE User_Id = ? AND Publication_Id = ? AND Edition_Id = ?",
            [userId, publicationId, editionId]
        );
        if (permission === "") {
            return conn.query(
                "DELETE FROM user_permission WHERE User_Id = ? AND Publication_Id = ? AND Edition_Id = ?",
                [userId, publicationId, editionId]
            );
        }


        if (existingPermission) {
            if (existingPermission.permission !== permission) {
                return conn.query(
                    "UPDATE user_permission SET permission = ? WHERE User_Id = ? AND Publication_Id = ? AND Edition_Id = ?",
                    [permission, userId, publicationId, editionId]
                );
            }
        } else {
            return conn.query(
                "INSERT INTO user_permission (User_Id, Publication_Id, Edition_Id, permission) VALUES (?, ?, ?, ?)",
                [userId, publicationId, editionId, permission]
            );
        }
    });

    await Promise.all(queries);
    conn.release();

    return res.status(200).json({
        success: true,
        message: "Permissions updated successfully",
    });
});



export const getAllUsers = TryCatch(async (req, res, next) => {

    const conn = await getConnection();
    const users = await conn.query("SELECT User_Id, User_Name, Email ,isAdmin , isActive FROM user order by User_Name");

    const permissionsResults = await conn.query(
        `SELECT up.User_Id,
            p.Publication_Name, 
            e.Edition_Name, 
            up.permission 
         FROM user_permission up
         JOIN publication p ON up.Publication_Id = p.Publication_Id
         JOIN edition e ON up.Edition_Id = e.Edition_Id
        `
    );
    conn.release()

    const permissionsMap: Record<string, PermissionType[]> = {};

    permissionsResults.forEach((perm: any) => {
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
    const formattedUsers = users.map((user: any) => ({
        userId: user.User_Id,
        isAdmin: user.isAdmin,
        isActive: user.isActive,
        userName: user.User_Name,
        emailId: user.Email,
        permissions: permissionsMap[user.User_Id] || [],
    }));

    return res.status(200).json({
        success: true,
        users: formattedUsers,
    });
})


export const logout = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).cookie("token", "", {
        expires: new Date(Date.now()),
    }).json({
        success: true,
        message: "logout successfully"
    })
}


export const deleteUserPermission = TryCatch(async (
    req: Request<{ userId?: string }, {}, { publicationId: string; editionId: string }>,
    res,
    next
) => {
    const { userId } = req.params;
    const { publicationId, editionId } = req.body;

    if (!userId || !publicationId || !editionId) {
        return next(new ErrorHandler("User ID, Publication ID, and Edition ID are required", 400));
    }

    const conn = await getConnection();

    const [user] = await conn.query("SELECT * FROM user WHERE User_Id = ?", [userId]);

    if (!user) {
        conn.release();
        return next(new ErrorHandler("User not found", 404));
    }


    const { affectedRows } = await conn.query(
        "DELETE FROM user_permission WHERE User_Id = ? AND Publication_Id = ? AND Edition_Id = ?",
        [userId, publicationId, editionId]
    );


    conn.release();

    return res.status(200).json({
        success: true,
        message: affectedRows > 0 ? `${affectedRows} Permission deleted successfully` : "Permission Already deleted"
    });
});

