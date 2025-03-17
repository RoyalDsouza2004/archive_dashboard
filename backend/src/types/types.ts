import { NextFunction, Request, Response } from "express";
import { PoolConnection } from "mariadb";

export type ControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;


declare module 'express' {
  interface Request {
    dbConnection?: PoolConnection;
  }
}

export interface NewNewspaperType {
  publication:string,
  unit: string,
  date: Date,
}

export type UploadFilesType = {
  Sub_Edition_Id: string,
  date: Date,
  Page_No_From: number,
  Page_No_To: number,
  filePath: string
}