import { TryCatch } from "./error.js";
import { Request, Response, NextFunction } from "express";
import { getConnection } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
import jwt, { JwtPayload } from "jsonwebtoken"


export const isAdmin = TryCatch(async (req, res: Response, next: NextFunction) => {
  const { token } = req.cookies;

  if (!token) return next(new ErrorHandler("Unauthorized", 401));


  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string }

  const conn = await getConnection();
  const [user] = await conn.query("SELECT isAdmin FROM user WHERE User_Id = ?", [decoded.id]);
  conn.release();

  if (!user || !user.isAdmin) {
    return next(new ErrorHandler("Forbidden: Admins only", 403));
  }
  next();
})


export const readRoute = TryCatch(async (req, res, next) => {
  const { token } = req.cookies;

  const { publicationId, editionId } = req.query;

  if (!token) return next(new ErrorHandler("Unauthorized", 401));
  const { id, isAdmin } = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string, isAdmin: string }

  if (isAdmin) return next();


  if (!id || !publicationId || !editionId) {
    return next(new ErrorHandler("Invalid user or request data", 400));
  }
  const conn = await getConnection();


  const [result] = await conn.query(
    "SELECT permission FROM user_permission WHERE User_Id = ? AND Publication_Id = ? AND Edition_Id = ?",
    [id, publicationId, editionId]
  );

  conn.release();

  if ((!result || (result.permission !== "r" && result.permission !== "rw"))) {
    return next(new ErrorHandler("Access denied: Insufficient permission", 403));
  }

  next();
})


export const writeRoute = TryCatch(async (req, res, next) => {
  const { publicationId, editionId } = req.query;
  const { token } = req.cookies;

  if (!token) return next(new ErrorHandler("Unauthorized", 401));
  const { id, isAdmin } = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string, isAdmin: string }

  if (isAdmin) return next();

  if (!id || !publicationId || !editionId) {
    return next(new ErrorHandler("Invalid user or request data", 400));
  }

  const conn = await getConnection();


  const [result] = await conn.query(
    "SELECT permission FROM user_permission WHERE User_Id = ? AND Publication_Id = ? AND Edition_Id = ?",
    [id, publicationId, editionId]
  );

  conn.release();

  if ((!result || (result.permission !== "w" && result.permission !== "rw"))) {
    return next(new ErrorHandler("Access denied: Insufficient permission", 403));
  }

  next();
})

export const authenticatedUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ authenticated: false});
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload & {
      id: string;
      userName: string;
      isAdmin: boolean;
    };

    const conn = await getConnection();

    const [{ isActive, isAdmin }] = await conn.query(
      "SELECT isActive, isAdmin FROM user WHERE User_Id = ?",
      [decoded.id]
    );

    conn.release();

    if (!isActive) {
      return res.status(401).cookie("token", "", {
        httpOnly: true,
        expires: new Date(Date.now()),
      }).json({ authenticated: false, message: "Unauthorised" });
    }

    let finalToken = token;

    if (decoded.isAdmin !== isAdmin) {
      const originalExp = decoded.exp;
      console.log(originalExp)

      if (!originalExp) {
        return res.status(401).json({ authenticated: false, message: "Invalid token structure" });
      }

      const expiresInSeconds = originalExp - Math.floor(Date.now() / 1000);

      finalToken = jwt.sign(
        {
          id: decoded.id,
          userName: decoded.userName,
          isAdmin: isAdmin,
        },
        process.env.JWT_SECRET as string,
        {
          expiresIn: expiresInSeconds,
        }
      );

      res.cookie("token", finalToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(originalExp * 1000),
      });
    }

    return res.status(200).json({
      authenticated: true,
      userId: decoded.id,
      userName: decoded.userName,
      isAdmin,
      token: finalToken,
    });

  } catch (err) {
    return res.status(401).cookie("token", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    }).json({ authenticated: false, message: "Something Went Wrong" });
  }
};