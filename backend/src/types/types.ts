import { NextFunction, Request, Response } from "express";

export type ControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;



export interface UploadRequestBody {
  editionId:string,
  publicationId: string,
  date: Date,
  pages?: { pageFrom: number; pageTo: number }[] | string[];
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

 export interface CustomRequest extends Request {
  body:UploadRequestBody;
  publicationName?: string;
  editionName?: string;
}

