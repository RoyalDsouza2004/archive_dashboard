import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import { getConnection } from "../utils/features.js";
import { PermissionType, UserType } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import bcrypt from "bcryptjs";


export const addUser = TryCatch(async (req:Request<{} , {} , UserType>, res, next) => {
      

      const { userId, userName, password, permissions } = req.body;

      if (!userId || !userName || !password) {
            return next(new ErrorHandler("Please Provide all fields" , 400))
      }
      const hashedPassword: string = await bcrypt.hash(password, 10);
      const hashUserId: string =  await bcrypt.hash(userId, 10);
      const conn = await getConnection();

      await conn.query("INSERT INTO user (User_Id, User_Name, Password) VALUES (?, ?, ?)", [
            hashUserId,
            userName,
            hashedPassword,
      ]);

      if (permissions && permissions.length > 0) {
            const permissionQueries = permissions.map(({ publicationId, editionId, permission }) => {
                return conn.query(
                    "INSERT INTO user_permission (User_Id, Publication_Id, Edition_Id, permission) VALUES (?, ?, ?, ?)",
                    [hashUserId, publicationId, editionId, permission]
                );
            });

            await Promise.all(permissionQueries);
        }

      return res.status(200).json({
            success:true, 
            message: "User Created Successfully",
      })

})

export const getUser = TryCatch(async(req , res , next) =>{
      const { userId } = req.params;

        if (!userId) {
            return  next(new ErrorHandler("user ID required" , 400))
        }

        const conn = await getConnection();

        const [user] = await conn.query(
            "SELECT User_Name FROM user WHERE User_Id = ?",
            [userId]
        );

        if (!user) {
            return  next(new ErrorHandler("User not found" , 404))
        }

        const permissionsResults = await conn.query(
            "SELECT Publication_Id, Edition_Id, permission FROM user_permission WHERE User_Id = ?",
            [userId]
        );

        const permissions: PermissionType[] = permissionsResults.map((perm: any) => ({
            publicationId: perm.Publication_Id,
            editionId: perm.Edition_Id,
            permission: perm.permission
        }));

        return res.status(200).json({
            success: true,
            user: {
                userName: user.User_Name,
                permissions: permissions
            }
        });

})