import { NextFunction, Request, Response } from "express";

export type ControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;



export interface UploadRequestBody {
  date: Date,
  pages?: { pageNoFrom: number; pageNoTo: number }[] | string[];
}

export type UploadFilesType = {
  subEditionId: string | null,
  date: Date,
  pageNoFrom: number,
  pageNoTo: number,
  filePath: string
}

export type Publication = {
   Publication_Name: string,
   Publication_Id?:string
  };

export type Edition = { 
  Edition_Name: string,
  Edition_Id?:string
 };

 
 export interface PermissionType {
  publicationId: string;
  editionId: string;
  permission: "r" | "w" | "rw";
}

 export interface UserType {
  email: string;
  userName: string;
  password: string;
  permissions?: PermissionType[];
}
