import { NextFunction, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import { Edition, Publication } from "../types/types.js";
import { getConnection } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
import path from "path";

export const getPublication = TryCatch(async (req, res, next) => {

      const conn = await getConnection()

      const publications: Publication[] = await conn.query("select Publication_Id ,Publication_Name from publication")
      conn.release()

      res.status(200).json({
            success: true,
            publications
      });

})

export const getEdition = TryCatch(async (req, res, next) => {

      const { publicationId } = req.query

      if (!publicationId) return next(new ErrorHandler("Please provide Publication Id", 400))

      const conn = await getConnection()

      const editions: Edition[] = await conn.query(`SELECT e.Edition_Name, e.Edition_Id FROM edition e
            JOIN publication_edition pe ON e.Edition_Id = pe.Edition_Id
            WHERE pe.Publication_Id = ?;` , publicationId)
      conn.release()

      res.status(200).json({
            success: true,
            editions
      });

})

export const searchPapers = TryCatch(async (req, res: Response, next: NextFunction) => {
      const { editionId, subEditionId, publicationId, date } = req.query as {
            editionId?: string;
            subEditionId?: string;
            publicationId?: string;
            date?: string;
      };

      const conn = await getConnection();

      let logs;

      if (subEditionId) {
            logs = await conn.query(
            `SELECT l.Page_No_From, l.Page_No_To, l.path, l.Date, se.Sub_Edition_Name
           FROM log l
           JOIN sub_edition se ON l.Sub_Edition_Id = se.Sub_Edition_Id
           WHERE l.Sub_Edition_Id = ? AND l.Date = ? 
           ORDER BY l.Page_No_From asc`,
                  [subEditionId.toUpperCase(), date]
            );
      } else {
            logs = await conn.query(
            `SELECT l.Page_No_From, l.Page_No_To, l.path, l.Date, se.Sub_Edition_Name
           FROM log l
           JOIN sub_edition se ON l.Sub_Edition_Id = se.Sub_Edition_Id
           WHERE se.Publication_Id = ? AND se.Edition_Id = ? AND l.Date = ?
           ORDER BY l.Page_No_From asc`,
                  [publicationId?.toUpperCase(), editionId?.toUpperCase(), date]
            );
      }
      conn.release();

      const formattedLogs = logs.reduce((acc: Record<string, { Page: number | string; Path: string }[]>, log: {
            Page_No_From: number;
            Page_No_To: number;
            path: string;
            Sub_Edition_Name: string;
      }) => {
            const pageRange = log.Page_No_From === log.Page_No_To ? log.Page_No_From : `${log.Page_No_From}-${log.Page_No_To}`;


            const pdfName = path.basename(log.path);

            const entry = { Page: pageRange, Path: log.path, PDFName: pdfName };

            if (!acc[log.Sub_Edition_Name]) {
                  acc[log.Sub_Edition_Name] = [];
            }
            acc[log.Sub_Edition_Name].push(entry);

            return acc;
      }, {});

      res.status(200).json({
            success: true,
            logs: formattedLogs
      });
});
