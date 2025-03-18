import { NextFunction, Request, Response } from "express";

export type ControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;



export interface NewNewspaperType {
  editionId:string,
  publicationId: string,
  date: Date,
}

export type UploadFilesType = {
  subEditionId: string,
  date: Date,
  pageNoFrom: number,
  pageNoTo: number,
  filePath: string
}